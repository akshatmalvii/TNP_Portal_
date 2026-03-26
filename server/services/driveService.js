import sequelize from "../config/db.js";
import driveRepository from "../repositories/driveRepository.js";
import studentApplicationRepository from "../repositories/studentApplicationRepository.js";
import Student from "../models/student.js";
import Drive from "../models/drive.js";
import Course from "../models/course.js";
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
    company_id,
    role_title,
    role_description,
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

  // Deep Validation: Check if selected courses actually belong to the selected departments
  const validCourses = await Course.findAll({
    where: { course_id: allowed_courses }
  });

  const invalidCourses = validCourses.some(c => !allowed_departments.includes(c.dept_id));
  if (validCourses.length !== allowed_courses.length || invalidCourses) {
    throw { status: 400, message: "One or more selected courses do not belong to the allowed departments." };
  }

  const transaction = await sequelize.transaction();

  try {
    const drive = await Drive.create({
      company_id,
      role_title,
      role_description,
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

const updateDriveTransaction = async (drive_id, driveData, staffId) => {
  const transaction = await sequelize.transaction();
  try {
    const drive = await Drive.findByPk(drive_id, { transaction });
    if (!drive) throw { status: 404, message: "Drive not found" };

    const {
      company_id, role_title, role_description, offer_type,
      package_lpa, deadline, drive_status, approval_status,
      allowed_departments, allowed_courses, eligibility, dynamic_form_fields
    } = driveData;

    // 1. Update root Drive record
    await drive.update({
      company_id,
      role_title,
      role_description: role_description || null,
      offer_type,
      package_lpa: package_lpa || null,
      deadline,
      drive_status: drive_status || drive.drive_status,
      approval_status: approval_status || drive.approval_status
    }, { transaction });

    // 2. Wipe existing dependent relational arrays
    await DriveAllowedDepartment.destroy({ where: { drive_id }, transaction });
    await DriveAllowedCourse.destroy({ where: { drive_id }, transaction });
    await DriveEligibility.destroy({ where: { drive_id }, transaction });
    await DynamicFormField.destroy({ where: { drive_id }, transaction });

    // 3. Re-insert arrays if provided
    if (allowed_departments && allowed_departments.length > 0) {
      await DriveAllowedDepartment.bulkCreate(
        allowed_departments.map(dept_id => ({ drive_id, dept_id })),
        { transaction }
      );
    }

    if (allowed_courses && allowed_courses.length > 0) {
      await DriveAllowedCourse.bulkCreate(
        allowed_courses.map(course_id => ({ drive_id, course_id })),
        { transaction }
      );
    }

    if (eligibility) {
      await DriveEligibility.create({
        drive_id,
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
          drive_id,
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

const deleteDrive = async (drive_id, staffId) => {
  const transaction = await sequelize.transaction();
  try {
    const drive = await Drive.findByPk(drive_id, { transaction });
    if (!drive) throw { status: 404, message: "Drive not found" };

    // Wipe child dependencies natively to prevent Constraint blocks if DB lacks ON DELETE CASCADE
    await DriveAllowedDepartment.destroy({ where: { drive_id }, transaction });
    await DriveAllowedCourse.destroy({ where: { drive_id }, transaction });
    await DriveEligibility.destroy({ where: { drive_id }, transaction });
    await DynamicFormField.destroy({ where: { drive_id }, transaction });
    
    // Note: We are currently erasing student_applications mapped to this! In a production
    // env, you'd block deletion. We proceed for dev mode simplicity via cascaded wipe.
    const StudentApplication = (await import("../models/student_application.js")).default;
    await StudentApplication.destroy({ where: { drive_id }, transaction });

    await drive.destroy({ transaction });
    await transaction.commit();

    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  listOpenDrivesForStudent,
  getStudentApplications,
  applyToDrive,
  createDriveTransaction,
  updateDriveTransaction,
  deleteDrive
};