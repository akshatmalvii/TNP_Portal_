import sequelize from "../config/db.js";

/**
 * Creates triggers for the drives table:
 * 1. AFTER INSERT ON drives -> logs to audit_logs
 * 2. BEFORE UPDATE ON drives -> sets updated_at to NOW()
 */
const createDriveTriggers = async () => {
  try {
    // 1. Function and Trigger for audit_logs on drives INSERT
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION log_drive_creation()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (staff_id, action_type, action_description, logged_at)
        VALUES (
          NEW.created_by_staff, 
          'CREATE_DRIVE', 
          'Drive created for company_role_id: ' || NEW.company_role_id,
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_audit_create_drive ON drives;
    `);

    await sequelize.query(`
      CREATE TRIGGER trigger_audit_create_drive
      AFTER INSERT ON drives
      FOR EACH ROW
      EXECUTE FUNCTION log_drive_creation();
    `);

    // 2. Function and Trigger for updated_at on drives UPDATE
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_drives_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_drives_timestamp ON drives;
    `);

    await sequelize.query(`
      CREATE TRIGGER trigger_update_drives_timestamp
      BEFORE UPDATE ON drives
      FOR EACH ROW
      EXECUTE FUNCTION update_drives_updated_at();
    `);

    console.log("✅ Drive triggers created successfully");
  } catch (err) {
    console.error("❌ Error creating Drive triggers:", err.message);
  }
};

export default createDriveTriggers;
