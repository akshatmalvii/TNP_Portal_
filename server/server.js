import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import dotenv from "dotenv";

import User from "./models/users.js";
import Department from "./models/Department.js";
import Company from "./models/Company.js";
import Student from "./models/Student.js";
import Offer from "./models/Offer.js";
import StaffAdmin from "./models/staff_admin.js";
import StudentApplication from "./models/student_application.js";
import StudentVerificationRequest from "./models/student_verification_request.js";
import AuditLog from "./models/audit_log.js";
import DepartmentDefaultLock from "./models/department_default_lock.js";
import DriveAllowedDepartment from "./models/drive_allowed_department.js";
import DriveLockOverride from "./models/drive_lock_override.js";
import DriveSelection from "./models/drive_selection.js";
import Drive from "./models/drive.js";
import LockRule from "./models/lock_rule.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TNP Portal API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

dotenv.config();

sequelize.authenticate()
  .then(() => {
    console.log("PostgreSQL connected successfully");
  })
  .then(async () => {

    await User.sync();
    console.log("users table synced");

    await Department.sync();
    console.log("departments table synced");

    await Company.sync();
    console.log("companies table synced");

    await StaffAdmin.sync();
    console.log("staff_admins table synced");

    await Student.sync();
    console.log("students table synced");

    await Drive.sync();
    console.log("drives table synced");

    await StudentApplication.sync();
    console.log("student_applications table synced");

    await DriveSelection.sync();
    console.log("drive_selections table synced");

    await Offer.sync();
    console.log("offers table synced");

    await DriveAllowedDepartment.sync();
    console.log("drive_allowed_departments table synced");

    await LockRule.sync();
    console.log("lock_rules table synced");

    await DepartmentDefaultLock.sync();
    console.log("department_default_lock table synced");

    await DriveLockOverride.sync();
    console.log("drive_lock_override table synced");

    await StudentVerificationRequest.sync();
    console.log("student_verification_requests table synced");

    await AuditLog.sync();
    console.log("audit_logs table synced");

    console.log("All tables synced with database");

  })
  .catch((err) => {
    console.error("Unable to connect to DB:", err);
  });

export default app;