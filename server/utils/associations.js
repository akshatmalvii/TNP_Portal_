import User from '../models/users.js';
import Role from '../models/role.js';
import Department from '../models/department.js';
import StaffAdmin from '../models/staff_admin.js';
import DepartmentTpoAssignment from '../models/department_tpo_assignment.js';
import Student from '../models/student.js';
import Course from '../models/course.js';
import StudentEducation from '../models/student_education.js';
import StudentDocument from '../models/student_document.js';
import Company from '../models/company.js';
import CompanyContact from '../models/company_contact.js';
import CompanyRole from '../models/company_role.js';
import Drive from '../models/drive.js';
import DriveAllowedDepartment from '../models/drive_allowed_department.js';
import DriveAllowedCourse from '../models/drive_allowed_course.js';
import DriveDocument from '../models/drive_document.js';
import DriveEligibility from '../models/drive_eligibility.js';
import PlacementPolicyRule from '../models/placement_policy_rule.js';
import DepartmentPolicyRule from '../models/department_policy_rule.js';
import DrivePolicyOverride from '../models/drive_policy_override.js';
import StudentApplication from '../models/student_application.js';
import DynamicFormField from '../models/dynamic_form_field.js';
import DynamicFormResponse from '../models/dynamic_form_response.js';
import DriveSelection from '../models/drive_selection.js';
import Offer from '../models/offer.js';
import StudentVerificationRequest from '../models/student_verification_request.js';
import AuditLog from '../models/audit_log.js';

// ─── ROLE ↔ USER ────────────────────────────────────────
Role.hasMany(User, {foreignKey: 'role_id'});
User.belongsTo(Role, {foreignKey: 'role_id'});

// ─── USER ↔ STUDENT ─────────────────────────────────────
User.hasOne(Student, {foreignKey: 'user_id'});
Student.belongsTo(User, {foreignKey: 'user_id'});

// ─── USER ↔ STAFF ADMIN ─────────────────────────────────
User.hasOne(StaffAdmin, {foreignKey: 'user_id'});
StaffAdmin.belongsTo(User, {foreignKey: 'user_id'});

// ─── DEPARTMENT ↔ STAFF ADMIN ───────────────────────────
Department.hasMany(StaffAdmin, {foreignKey: 'dept_id'});
StaffAdmin.belongsTo(Department, {foreignKey: 'dept_id'});

// ─── DEPARTMENT ↔ TPO ASSIGNMENT ────────────────────────
Department.hasOne(DepartmentTpoAssignment, {foreignKey: 'dept_id'});
DepartmentTpoAssignment.belongsTo(Department, {foreignKey: 'dept_id'});

StaffAdmin.hasMany(DepartmentTpoAssignment, {foreignKey: 'tpo_staff_id'});
DepartmentTpoAssignment.belongsTo(StaffAdmin, {foreignKey: 'tpo_staff_id'});

// ─── DEPARTMENT ↔ STUDENT ───────────────────────────────
Department.hasMany(Student, {foreignKey: 'dept_id'});
Student.belongsTo(Department, {foreignKey: 'dept_id'});

// ─── COURSE ↔ STUDENT ───────────────────────────────────
Course.hasMany(Student, {foreignKey: 'course_id'});
Student.belongsTo(Course, {foreignKey: 'course_id'});

// ─── STUDENT ↔ EDUCATION ────────────────────────────────
Student.hasMany(StudentEducation, {foreignKey: 'student_id'});
StudentEducation.belongsTo(Student, {foreignKey: 'student_id'});

// ─── STUDENT ↔ DOCUMENTS ────────────────────────────────
Student.hasMany(StudentDocument, {foreignKey: 'student_id'});
StudentDocument.belongsTo(Student, {foreignKey: 'student_id'});

// ─── COMPANY ↔ CONTACTS ─────────────────────────────────
Company.hasMany(CompanyContact, {foreignKey: 'company_id'});
CompanyContact.belongsTo(Company, {foreignKey: 'company_id'});

// ─── COMPANY ↔ ROLES ────────────────────────────────────
Company.hasMany(CompanyRole, {foreignKey: 'company_id'});
CompanyRole.belongsTo(Company, {foreignKey: 'company_id'});

// ─── COMPANY ↔ DRIVE ───────────────────────────────
Company.hasMany(Drive, {foreignKey: 'company_id'});
Drive.belongsTo(Company, {foreignKey: 'company_id'});

// ─── STAFF ADMIN ↔ DRIVE (created / approved) ──────────
StaffAdmin.hasMany(Drive, {
    foreignKey: 'created_by_staff',
    as: 'createdDrives',
});
Drive.belongsTo(StaffAdmin, {foreignKey: 'created_by_staff', as: 'creator'});

StaffAdmin.hasMany(Drive, {
    foreignKey: 'approved_by_staff',
    as: 'approvedDrives',
});
Drive.belongsTo(StaffAdmin, {foreignKey: 'approved_by_staff', as: 'approver'});

// ─── DRIVE ↔ ALLOWED DEPARTMENTS ────────────────────────
Drive.hasMany(DriveAllowedDepartment, {foreignKey: 'drive_id'});
DriveAllowedDepartment.belongsTo(Drive, {foreignKey: 'drive_id'});

Department.hasMany(DriveAllowedDepartment, {foreignKey: 'dept_id'});
DriveAllowedDepartment.belongsTo(Department, {foreignKey: 'dept_id'});

// ─── DRIVE ↔ ALLOWED COURSES ────────────────────────────
Drive.hasMany(DriveAllowedCourse, {foreignKey: 'drive_id'});
DriveAllowedCourse.belongsTo(Drive, {foreignKey: 'drive_id'});

Course.hasMany(DriveAllowedCourse, {foreignKey: 'course_id'});
DriveAllowedCourse.belongsTo(Course, {foreignKey: 'course_id'});
Drive.hasMany(DriveDocument, {foreignKey: 'drive_id'});
DriveDocument.belongsTo(Drive, {foreignKey: 'drive_id'});

// ─── DRIVE ↔ ELIGIBILITY ────────────────────────────────
Drive.hasOne(DriveEligibility, {foreignKey: 'drive_id'});
DriveEligibility.belongsTo(Drive, {foreignKey: 'drive_id'});

// ─── PLACEMENT POLICY RULES ↔ DEPARTMENT / DRIVE ────────
PlacementPolicyRule.hasMany(DepartmentPolicyRule, {foreignKey: 'policy_id'});
DepartmentPolicyRule.belongsTo(PlacementPolicyRule, {foreignKey: 'policy_id'});

Department.hasMany(DepartmentPolicyRule, {foreignKey: 'dept_id'});
DepartmentPolicyRule.belongsTo(Department, {foreignKey: 'dept_id'});

StaffAdmin.hasMany(DepartmentPolicyRule, {
    foreignKey: 'changed_by_staff',
    as: 'departmentPolicyChanges',
});
DepartmentPolicyRule.belongsTo(StaffAdmin, {
    foreignKey: 'changed_by_staff',
    as: 'changedBy',
});

PlacementPolicyRule.hasMany(DrivePolicyOverride, {foreignKey: 'policy_id'});
DrivePolicyOverride.belongsTo(PlacementPolicyRule, {foreignKey: 'policy_id'});

Drive.hasOne(DrivePolicyOverride, {foreignKey: 'drive_id'});
DrivePolicyOverride.belongsTo(Drive, {foreignKey: 'drive_id'});

// ─── STUDENT ↔ APPLICATIONS ─────────────────────────────
Student.hasMany(StudentApplication, {foreignKey: 'student_id'});
StudentApplication.belongsTo(Student, {foreignKey: 'student_id'});

Drive.hasMany(StudentApplication, {foreignKey: 'drive_id'});
StudentApplication.belongsTo(Drive, {foreignKey: 'drive_id'});

// ─── DRIVE ↔ DYNAMIC FORM FIELDS ────────────────────────
Drive.hasMany(DynamicFormField, {foreignKey: 'drive_id'});
DynamicFormField.belongsTo(Drive, {foreignKey: 'drive_id'});

// ─── APPLICATION ↔ DYNAMIC FORM RESPONSES ───────────────
StudentApplication.hasMany(DynamicFormResponse, {foreignKey: 'application_id'});
DynamicFormResponse.belongsTo(StudentApplication, {
    foreignKey: 'application_id',
});

DynamicFormField.hasMany(DynamicFormResponse, {foreignKey: 'field_id'});
DynamicFormResponse.belongsTo(DynamicFormField, {foreignKey: 'field_id'});

// ─── APPLICATION ↔ DRIVE SELECTION ──────────────────────
StudentApplication.hasOne(DriveSelection, {foreignKey: 'application_id'});
DriveSelection.belongsTo(StudentApplication, {foreignKey: 'application_id'});

// ─── APPLICATION ↔ OFFER ────────────────────────────────
StudentApplication.hasOne(Offer, {foreignKey: 'application_id'});
Offer.belongsTo(StudentApplication, {foreignKey: 'application_id'});

// ─── STUDENT ↔ VERIFICATION REQUEST ─────────────────────
Student.hasOne(StudentVerificationRequest, {foreignKey: 'student_id'});
StudentVerificationRequest.belongsTo(Student, {foreignKey: 'student_id'});

StaffAdmin.hasMany(StudentVerificationRequest, {
    foreignKey: 'verified_by_coordinator',
    as: 'coordinatorVerifications',
});
StudentVerificationRequest.belongsTo(StaffAdmin, {
    foreignKey: 'verified_by_coordinator',
    as: 'coordinator',
});

StaffAdmin.hasMany(StudentVerificationRequest, {
    foreignKey: 'approved_by_tpo',
    as: 'tpoApprovals',
});
StudentVerificationRequest.belongsTo(StaffAdmin, {
    foreignKey: 'approved_by_tpo',
    as: 'tpoApprover',
});

// ─── STAFF ADMIN ↔ AUDIT LOG ────────────────────────────
StaffAdmin.hasMany(AuditLog, {foreignKey: 'staff_id'});
AuditLog.belongsTo(StaffAdmin, {foreignKey: 'staff_id'});
