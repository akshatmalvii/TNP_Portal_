import sequelize from "../config/db.js";
import driveRepository from "../repositories/driveRepository.js";
import studentApplicationRepository from "../repositories/studentApplicationRepository.js";
import Student from "../models/student.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import DriveEligibility from "../models/drive_eligibility.js";
import DynamicFormField from "../models/dynamic_form_field.js";

const listOpenDrivesForStudent = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  const drives = await driveRepository.findOpenForDept(student.dept_id);
  return drives;
};

const getStudentApplications = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  return studentApplicationRepository.findByStudent(student.student_id);
};

const applyToDrive = async (student_id, drive_id, application_data = null) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  if (!student.is_verified) {
    throw { status: 403, message: "Student verification required before applying to drives" };
  }

  const existing = await studentApplicationRepository.findByStudentAndDrive(student.student_id, drive_id);
  if (existing) {
    throw { status: 400, message: "Already applied to this drive" };
  }

  return studentApplicationRepository.create({
    student_id: student.student_id,
    drive_id,
    application_data,
    application_status: "APPLIED"
  });
};

const createDriveTransaction = async (driveData, staffId) => {
  const {
    company_role_id,
    offer_type,
    package_lpa,
    deadline,
    allowed_departments, 
    allowed_courses, 
    eligibility, 
    dynamic_form_fields 
  } = driveData;

  if (!allowed_departments || allowed_departments.length === 0) {
    throw { status: 400, message: "At least one department must be selected" };
  }
  if (!allowed_courses || allowed_courses.length === 0) {
    throw { status: 400, message: "At least one course must be selected" };
  }

  const transaction = await sequelize.transaction();

  try {
    const drive = await Drive.create({
      company_role_id,
      created_by_staff: staffId,
      offer_type,
      package_lpa,
      deadline,
      drive_status: "Active",
      approval_status: "Approved"
    }, { transaction });

    await DriveAllowedDepartment.bulkCreate(
      allowed_departments.map(dept_id => ({ drive_id: drive.drive_id, dept_id })),
      { transaction }
    );

    await DriveAllowedCourse.bulkCreate(
      allowed_courses.map(course_id => ({ drive_id: drive.drive_id, course_id })),
      { transaction }
    );

    if (eligibility) {
      await DriveEligibility.create({
        drive_id: drive.drive_id,
        min_cgpa: eligibility.min_cgpa || null,
        max_backlogs: eligibility.max_backlogs || 0,
        min_10th_percent: eligibility.min_10th_percent || null,
        min_12th_percent: eligibility.min_12th_percent || null,
        gender: eligibility.gender || 'Any',
        passing_year: eligibility.passing_year || null
      }, { transaction });
    }

    if (dynamic_form_fields && dynamic_form_fields.length > 0) {
      await DynamicFormField.bulkCreate(
        dynamic_form_fields.map((field, index) => ({
          drive_id: drive.drive_id,
          field_label: field.label,
          field_type: field.type,
          is_required: field.required || false,
          field_order: field.order || (index + 1)
        })),
        { transaction }
      );
    }

    await transaction.commit();
    return drive;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  listOpenDrivesForStudent,
  getStudentApplications,
  applyToDrive,
  createDriveTransaction
};