import sequelize from "../config/db.js";

const ensureDepartmentPolicyHistorySchema = async () => {
  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ADD COLUMN IF NOT EXISTS effective_to TIMESTAMP WITH TIME ZONE;
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ADD COLUMN IF NOT EXISTS changed_by_staff INTEGER REFERENCES staff_admins(staff_id);
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ADD COLUMN IF NOT EXISTS change_note TEXT;
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `);

  await sequelize.query(`
    UPDATE department_policy_rules
    SET effective_from = COALESCE(effective_from, NOW())
    WHERE effective_from IS NULL;
  `);

  await sequelize.query(`
    UPDATE department_policy_rules
    SET created_at = COALESCE(created_at, effective_from, NOW())
    WHERE created_at IS NULL;
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ALTER COLUMN effective_from SET NOT NULL;
  `);

  await sequelize.query(`
    ALTER TABLE department_policy_rules
    ALTER COLUMN created_at SET NOT NULL;
  `);

  const [constraints] = await sequelize.query(`
    SELECT conname, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE conrelid = 'department_policy_rules'::regclass
      AND contype = 'u';
  `);

  for (const constraint of constraints) {
    if (String(constraint.definition || "").includes("(dept_id)")) {
      await sequelize.query(`
        ALTER TABLE department_policy_rules
        DROP CONSTRAINT IF EXISTS "${constraint.conname}";
      `);
    }
  }

};

export default ensureDepartmentPolicyHistorySchema;
