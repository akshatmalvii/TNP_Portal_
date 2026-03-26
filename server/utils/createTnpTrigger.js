import sequelize from "../config/db.js";

/**
 * Creates the TNP ID generation infrastructure in PostgreSQL:
 * 1. tnp_id_sequence table - tracks last sequence per (year, dept_id)
 * 2. generate_tnp_id() PL/pgSQL function - atomically generates next TNP ID
 * 3. trigger_generate_tnp_id - AFTER UPDATE trigger on student_verification_requests
 *
 * TNP ID Format: DEPTCODE + YY + SEQ(3 digits)
 * Example: CSE26001, IT26002
 */
const createTnpTrigger = async () => {
  try {
    // 1. Create sequence tracking table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tnp_id_sequence (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        dept_id INTEGER NOT NULL,
        last_seq INTEGER NOT NULL DEFAULT 0,
        UNIQUE(year, dept_id)
      );
    `);

    // 2. Create the TNP ID generator function
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION generate_tnp_id(p_student_id INTEGER)
      RETURNS TEXT AS $$
      DECLARE
        v_dept_id INTEGER;
        v_dept_code TEXT;
        v_year INTEGER;
        v_yy TEXT;
        v_seq INTEGER;
        v_tnp_id TEXT;
        v_existing_tnp TEXT;
      BEGIN
        -- Check if student already has a TNP ID (generate only once)
        SELECT tnp_id INTO v_existing_tnp FROM students WHERE student_id = p_student_id;
        IF v_existing_tnp IS NOT NULL THEN
          RETURN v_existing_tnp;
        END IF;

        -- Get student's department
        SELECT s.dept_id, d.dept_code
        INTO v_dept_id, v_dept_code
        FROM students s
        JOIN departments d ON d.dept_id = s.dept_id
        WHERE s.student_id = p_student_id;

        IF v_dept_id IS NULL THEN
          RAISE EXCEPTION 'Student % has no department assigned', p_student_id;
        END IF;

        -- Get current 2-digit year
        v_year := EXTRACT(YEAR FROM CURRENT_DATE);
        v_yy := LPAD(MOD(v_year, 100)::TEXT, 2, '0');

        -- Atomically increment sequence (INSERT or UPDATE with row-level lock)
        INSERT INTO tnp_id_sequence (year, dept_id, last_seq)
        VALUES (v_year, v_dept_id, 1)
        ON CONFLICT (year, dept_id)
        DO UPDATE SET last_seq = tnp_id_sequence.last_seq + 1
        RETURNING last_seq INTO v_seq;

        -- Build TNP ID: DEPTCODE + YY + SEQ(3)
        v_tnp_id := v_dept_code || v_yy || LPAD(v_seq::TEXT, 3, '0');

        -- Update student record
        UPDATE students SET tnp_id = v_tnp_id, updated_at = NOW()
        WHERE student_id = p_student_id;

        RETURN v_tnp_id;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 3. Create the trigger function
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION trigger_fn_generate_tnp_id()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only fire when coordinator_status changes to 'Approved'
        IF NEW.coordinator_status = 'Approved'
           AND (OLD.coordinator_status IS DISTINCT FROM 'Approved') THEN
          PERFORM generate_tnp_id(NEW.student_id);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Create the trigger (drop first to avoid duplicates)
    await sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_generate_tnp_id ON student_verification_requests;
    `);

    await sequelize.query(`
      CREATE TRIGGER trigger_generate_tnp_id
      AFTER UPDATE ON student_verification_requests
      FOR EACH ROW
      EXECUTE FUNCTION trigger_fn_generate_tnp_id();
    `);

    console.log("✅ TNP ID trigger + function created successfully");
  } catch (err) {
    console.error("❌ Error creating TNP ID trigger:", err.message);
  }
};

export default createTnpTrigger;
