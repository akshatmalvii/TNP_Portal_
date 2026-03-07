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


// Users
User.hasOne(Student, { foreignKey: "user_id" });
Student.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(StaffAdmin, { foreignKey: "user_id" });
StaffAdmin.belongsTo(User, { foreignKey: "user_id" });

// Departments
Department.hasMany(Student, { foreignKey: "dept_id" });
Student.belongsTo(Department, { foreignKey: "dept_id" });

Department.hasMany(StaffAdmin, { foreignKey: "dept_id" });
StaffAdmin.belongsTo(Department, { foreignKey: "dept_id" });

// Drives
Drive.belongsTo(Company, { foreignKey: "company_id" });
Drive.belongsTo(Department, { foreignKey: "dept_id" });

Drive.belongsTo(StaffAdmin, { foreignKey: "created_by_id" });
Drive.belongsTo(StaffAdmin, { foreignKey: "verified_by_id" });

// Applications
StudentApplication.belongsTo(Student, { foreignKey: "student_id" });
StudentApplication.belongsTo(Drive, { foreignKey: "drive_id" });

// Selections
DriveSelection.belongsTo(Student, { foreignKey: "student_id" });
DriveSelection.belongsTo(Drive, { foreignKey: "drive_id" });

// Offers
Offer.belongsTo(Student, { foreignKey: "student_id" });
Offer.belongsTo(Drive, { foreignKey: "drive_id" });

// Audit logs
AuditLog.belongsTo(StaffAdmin, { foreignKey: "staff_id" });