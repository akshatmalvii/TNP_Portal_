import sequelize from "./config/db.js";

const fixDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    await sequelize.query('ALTER TABLE staff_admins ALTER COLUMN dept_id DROP NOT NULL;');
    console.log("Successfully dropped NOT NULL constraint on dept_id in staff_admins.");
    
    process.exit(0);
  } catch (err) {
    console.error("Error fixing DB:", err);
    process.exit(1);
  }
};

fixDb();
