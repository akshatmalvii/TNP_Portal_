import User from "../models/users.js";
import Department from "../models/department.js";
import Company from "../models/company.js";
import Student from "../models/student.js";
import Offer from "../models/offer.js";
import StaffAdmin from "../models/staff_admin.js";
import Role from "../models/role.js";
import StudentCoordinatorAccount from "../models/student_coordinator_account.js";

import StudentApplication from "../models/student_application.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import AuditLog from "../models/audit_log.js";

import DepartmentDefaultLock from "../models/department_default_lock.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveLockOverride from "../models/drive_lock_override.js";
import DriveSelection from "../models/drive_selection.js";
import Drive from "../models/drive.js";
import LockRule from "../models/lock_rule.js";


// USER → STUDENT
User.hasOne(Student, { foreignKey: "user_id" });
Student.belongsTo(User, { foreignKey: "user_id" });

// USER → STAFF ADMIN
User.hasOne(StaffAdmin, { foreignKey: "user_id" });
StaffAdmin.belongsTo(User, { foreignKey: "user_id" });

// Departments
Department.hasMany(Student, { foreignKey: "dept_id" });
Student.belongsTo(Department, { foreignKey: "dept_id" });

Department.hasMany(StaffAdmin, { foreignKey: "dept_id" });
StaffAdmin.belongsTo(Department, { foreignKey: "dept_id" });

// Roles
Role.hasMany(StaffAdmin, { foreignKey: "role_id" });
StaffAdmin.belongsTo(Role, { foreignKey: "role_id" });

// Companies & Drives
Company.hasMany(Drive, { foreignKey: "company_id" });
Drive.belongsTo(Company, { foreignKey: "company_id" });

// Drive Admin Actions
StaffAdmin.hasMany(Drive, { foreignKey: "created_by_id", as: "createdDrives" });
Drive.belongsTo(StaffAdmin, { foreignKey: "created_by_id", as: "creator" });

StaffAdmin.hasMany(Drive, { foreignKey: "verified_by_id", as: "verifiedDrives" });
Drive.belongsTo(StaffAdmin, { foreignKey: "verified_by_id", as: "verifier" });

// LockRule Relationships
LockRule.hasMany(DepartmentDefaultLock, { foreignKey: "rule_id" });
DepartmentDefaultLock.belongsTo(LockRule, { foreignKey: "rule_id" });

LockRule.hasMany(DriveLockOverride, { foreignKey: "rule_id" });
DriveLockOverride.belongsTo(LockRule, { foreignKey: "rule_id" });

// Department Default Lock
Department.hasMany(DepartmentDefaultLock, { foreignKey: "dept_id" });
DepartmentDefaultLock.belongsTo(Department, { foreignKey: "dept_id" });

// Drive Allowed Departments
Drive.hasMany(DriveAllowedDepartment, { foreignKey: "drive_id" });
DriveAllowedDepartment.belongsTo(Drive, { foreignKey: "drive_id" });

Department.hasMany(DriveAllowedDepartment, { foreignKey: "dept_id" });
DriveAllowedDepartment.belongsTo(Department, { foreignKey: "dept_id" });

// Student Verification Requests
Student.hasMany(StudentVerificationRequest, { foreignKey: "student_id" });
StudentVerificationRequest.belongsTo(Student, { foreignKey: "student_id" });

StaffAdmin.hasMany(StudentVerificationRequest, { foreignKey: "verified_by" });
StudentVerificationRequest.belongsTo(StaffAdmin, { foreignKey: "verified_by" });

// Students Applications
Student.hasMany(StudentApplication, { foreignKey: "student_id" });
StudentApplication.belongsTo(Student, { foreignKey: "student_id" });

Drive.hasMany(StudentApplication, { foreignKey: "drive_id" });
StudentApplication.belongsTo(Drive, { foreignKey: "drive_id" });

// Drive Selections
Student.hasMany(DriveSelection, { foreignKey: "student_id" });
DriveSelection.belongsTo(Student, { foreignKey: "student_id" });

Drive.hasMany(DriveSelection, { foreignKey: "drive_id" });
DriveSelection.belongsTo(Drive, { foreignKey: "drive_id" });

// Offers
Student.hasMany(Offer, { foreignKey: "student_id" });
Offer.belongsTo(Student, { foreignKey: "student_id" });

Drive.hasMany(Offer, { foreignKey: "drive_id" });
Offer.belongsTo(Drive, { foreignKey: "drive_id" });

// Student Coordinator Accounts
Student.hasMany(StudentCoordinatorAccount, { foreignKey: "student_id" });
StudentCoordinatorAccount.belongsTo(Student, { foreignKey: "student_id" });

StaffAdmin.hasMany(StudentCoordinatorAccount, { foreignKey: "staff_id" });
StudentCoordinatorAccount.belongsTo(StaffAdmin, { foreignKey: "staff_id" });

Department.hasMany(StudentCoordinatorAccount, { foreignKey: "dept_id" });
StudentCoordinatorAccount.belongsTo(Department, { foreignKey: "dept_id" });

// Audit logs
StaffAdmin.hasMany(AuditLog, { foreignKey: "staff_id" });
AuditLog.belongsTo(StaffAdmin, { foreignKey: "staff_id" });

// Lock Rules
LockRule.hasMany(DepartmentDefaultLock, { foreignKey: "rule_id" });
DepartmentDefaultLock.belongsTo(LockRule, { foreignKey: "rule_id" });

LockRule.hasMany(DriveLockOverride, { foreignKey: "rule_id" });
DriveLockOverride.belongsTo(LockRule, { foreignKey: "rule_id" });

// Department Default Locks
Department.hasMany(DepartmentDefaultLock, { foreignKey: "dept_id" });
DepartmentDefaultLock.belongsTo(Department, { foreignKey: "dept_id" });

// Drive Lock Overrides
Drive.hasMany(DriveLockOverride, { foreignKey: "drive_id" });
DriveLockOverride.belongsTo(Drive, { foreignKey: "drive_id" });

Department.hasMany(DriveLockOverride, { foreignKey: "dept_id" });
DriveLockOverride.belongsTo(Department, { foreignKey: "dept_id" });

// Drive Allowed Departments
Drive.hasMany(DriveAllowedDepartment, { foreignKey: "drive_id" });
DriveAllowedDepartment.belongsTo(Drive, { foreignKey: "drive_id" });

Department.hasMany(DriveAllowedDepartment, { foreignKey: "dept_id" });
DriveAllowedDepartment.belongsTo(Department, { foreignKey: "dept_id" });

// Student Verification Requests
Student.hasMany(StudentVerificationRequest, { foreignKey: "student_id" });
StudentVerificationRequest.belongsTo(Student, { foreignKey: "student_id" });

StaffAdmin.hasMany(StudentVerificationRequest, { foreignKey: "verified_by" });
StudentVerificationRequest.belongsTo(StaffAdmin, { foreignKey: "verified_by" });