import sequelize from "../config/db.js";
import driveRepository from "../repositories/driveRepository.js";
import studentApplicationRepository from "../repositories/studentApplicationRepository.js";
import Student from "../models/student.js";
import Drive from "../models/drive.js";
import Company from "../models/company.js";
import Course from "../models/course.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import DriveDocument from "../models/drive_document.js";
import DriveEligibility from "../models/drive_eligibility.js";
import DynamicFormField from "../models/dynamic_form_field.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { getSignedCloudinaryDownloadUrl } from "../utils/cloudinaryFileUrl.js";
import departmentPolicyService from "./departmentPolicyService.js";
import StudentApplication from "../models/student_application.js";
import Offer from "../models/offer.js";
import { normalizePlacementSeason } from "../utils/placementSeason.js";

const attachSignedDriveDocuments = (drive) => {
  const plainDrive = drive.get ? drive.get({ plain: true }) : drive;

  plainDrive.DriveDocuments = (plainDrive.DriveDocuments || []).map((document) => ({
    ...document,
    view_url: getSignedCloudinaryDownloadUrl(document.file_url),
  }));

  return plainDrive;
};

const normalizeContractTerms = ({
  has_bond,
  bond_months,
  security_deposit_amount,
}) => {
  const normalizedHasBond = Boolean(has_bond);
  const normalizedBondMonths = normalizedHasBond
    ? Number.parseInt(bond_months, 10) || null
    : null;
  const normalizedSecurityDepositAmount = normalizedHasBond
    ? String(security_deposit_amount || "").trim() || null
    : null;

  if (normalizedHasBond) {
    if (!normalizedBondMonths) {
      throw { status: 400, message: "Bond duration is required when bond is enabled." };
    }

    if (!normalizedSecurityDepositAmount) {
      throw {
        status: 400,
        message: "Security cheque amount/details are required when bond is enabled.",
      };
    }
  }

  return {
    has_bond: normalizedHasBond,
    bond_months: normalizedBondMonths,
    has_security_deposit: normalizedHasBond,
    security_deposit_amount: normalizedSecurityDepositAmount,
  };
};

const PLACEMENT_OFFER_CATEGORIES = new Set(["Placement", "Internship+PPO", "PPO_Conversion"]);

const getAcceptedOffersForStudent = async (studentId) => {
  return StudentApplication.findAll({
    where: { student_id: studentId },
    include: [
      {
        model: Offer,
        where: { acceptance_status: "Accepted" },
        required: true,
      },
      {
        model: Drive,
        attributes: ["drive_id", "offer_type", "package_lpa"],
        required: false,
      },
    ],
  });
};

const getDepartmentPolicyContext = async (student) => {
  const [policyAssignment, acceptedApplications] = await Promise.all([
    departmentPolicyService.getDepartmentPolicyAt(student.dept_id),
    getAcceptedOffersForStudent(student.student_id),
  ]);

  return { policyAssignment, acceptedApplications };
};

const evaluateDepartmentPlacementPolicy = (policyContext, drive) => {
  const { policyAssignment, acceptedApplications } = policyContext;
  const policy = policyAssignment?.PlacementPolicyRule;

  if (!policy) {
    return true;
  }

  if (acceptedApplications.length === 0) {
    return true;
  }

  const acceptedOffers = acceptedApplications
    .map((application) => ({
      offer: application.Offer,
      drive: application.Drive,
    }))
    .filter((record) => record.offer);

  const hasAcceptedInternshipOnly = acceptedOffers.some(
    ({ offer }) => offer.offer_category === "Internship"
  );

  const acceptedPlacementOffers = acceptedOffers.filter(({ offer }) =>
    PLACEMENT_OFFER_CATEGORIES.has(offer.offer_category)
  );

  if (acceptedPlacementOffers.length === 0) {
    return hasAcceptedInternshipOnly ? policy.allow_apply_after_internship !== false : true;
  }

  if (policy.allow_apply_after_placement === false) {
    return false;
  }

  if (policy.ignore_package_condition) {
    return true;
  }

  const highestAcceptedPackage = Math.max(
    ...acceptedPlacementOffers.map(({ offer, drive: acceptedDrive }) =>
      Number(offer.offered_package || acceptedDrive?.package_lpa || 0)
    )
  );
  const drivePackage = Number(drive.package_lpa || 0);
  const minGap = Number(policy.min_package_difference || 0);

  return drivePackage - highestAcceptedPackage >= minGap;
};

const listOpenDrivesForStudent = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) throw { status: 404, message: "Student profile not found" };
  const StudentVerificationRequest = (await import("../models/student_verification_request.js")).default;
  const vr = await StudentVerificationRequest.findOne({ where: { student_id: student.student_id } });
  if (!vr || vr.coordinator_status !== "Approved") return []; // Unverified students see nothing

  const StudentEducation = (await import("../models/student_education.js")).default;
  const educations = await StudentEducation.findAll({ where: { student_id: student.student_id } });
  
  // Extract 10th and 12th grades
  const ssc = educations.find(e => e.education_type === "SSC");
  const hsc = educations.find(e => e.education_type === "HSC" || e.education_type === "Diploma");
  const tenth_percent = ssc ? parseFloat(ssc.percentage) : 0;
  const twelfth_percent = hsc ? parseFloat(hsc.percentage) : 0;

  const drives = await Drive.findAll({
    where: { drive_status: "Active", approval_status: "Approved" },
    include: [
      { model: Company, attributes: ["company_name"] },
      { model: DriveAllowedDepartment },
      { model: DriveAllowedCourse },
      { model: DriveEligibility },
      { model: DriveDocument }
    ],
    order: [["created_at", "DESC"]]
  });

  const eligibleDrives = drives.filter(drive => {
    // Check Dept and Course Allowances
    const allowedDepts = drive.DriveAllowedDepartments.map(d => d.dept_id);
    if (allowedDepts.length > 0 && !allowedDepts.includes(student.dept_id)) return false;

    const allowedCourses = drive.DriveAllowedCourses.map(c => c.course_id);
    if (allowedCourses.length > 0 && !allowedCourses.includes(student.course_id)) return false;

    // Check Eligibility Rules
    if (drive.DriveEligibility) {
      const e = drive.DriveEligibility;
      
      if (e.min_cgpa && parseFloat(student.cgpa || 0) < parseFloat(e.min_cgpa)) return false;
      if (e.max_backlogs !== null && (student.running_backlogs || 0) > e.max_backlogs) return false;
      if (e.min_10th_percent && tenth_percent < parseFloat(e.min_10th_percent)) return false;
      if (e.min_12th_percent && twelfth_percent < parseFloat(e.min_12th_percent)) return false;
      if (e.gender && e.gender !== "Any" && student.gender !== e.gender) return false;
      
      // We skip passing_year strictly unless student schema supports it.
    }

    return true;
  });
  const policyContext = await getDepartmentPolicyContext(student);

  const policyFilteredDrives = [];
  for (const drive of eligibleDrives) {
    const isAllowedByPolicy = evaluateDepartmentPlacementPolicy(policyContext, drive);
    if (isAllowedByPolicy) {
      policyFilteredDrives.push(drive);
    }
  }

  return policyFilteredDrives.map(d => {
    const plain = attachSignedDriveDocuments(d);
    plain.company_name = plain.Company?.company_name || 'Unknown Company';
    return plain;
  });
};

const getStudentApplications = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  return studentApplicationRepository.findByStudent(student.student_id);
};

const getDriveFormFields = async (drive_id) => {
  return DynamicFormField.findAll({
    where: { drive_id },
    order: [['field_order', 'ASC']]
  });
};

const uploadDriveDocuments = async (drive_id, files = []) => {
  const drive = await Drive.findByPk(drive_id);
  if (!drive) {
    throw { status: 404, message: "Drive not found" };
  }

  const validFiles = files.filter(Boolean);
  if (validFiles.length === 0) {
    return [];
  }

  for (const file of validFiles) {
    if (file.mimetype !== "application/pdf") {
      throw { status: 400, message: "Only PDF files are allowed for job descriptions" };
    }
  }

  const uploadedDocuments = [];
  for (const file of validFiles) {
    const uploadResult = await uploadToCloudinary(file.buffer, `tnp_portal/drives/${drive_id}`);

    const driveDocument = await DriveDocument.create({
      drive_id,
      file_name: file.originalname,
      file_url: uploadResult.secure_url,
    });

    uploadedDocuments.push({
      ...driveDocument.get({ plain: true }),
      view_url: getSignedCloudinaryDownloadUrl(driveDocument.file_url),
    });
  }

  return uploadedDocuments;
};

const applyToDrive = async (student_id, drive_id, application_data = null) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) throw { status: 404, message: "Student profile not found" };
  const StudentVerificationRequest = (await import("../models/student_verification_request.js")).default;
  const vr = await StudentVerificationRequest.findOne({ where: { student_id: student.student_id } });
  if (!vr || vr.coordinator_status !== "Approved") throw { status: 403, message: "Student verification required before applying to drives" };

  const existing = await studentApplicationRepository.findByStudentAndDrive(student.student_id, drive_id);
  if (existing) throw { status: 400, message: "Already applied to this drive" };

  // Double Check Eligibility serverside blocking API forgery
  const eligibleDrives = await listOpenDrivesForStudent(student_id);
  const isEligible = eligibleDrives.some(d => d.drive_id === parseInt(drive_id) || d.id === parseInt(drive_id));
  if (!isEligible) throw { status: 403, message: "You are not eligible to apply for this drive based on criteria." };

  const fields = await DynamicFormField.findAll({ where: { drive_id } });
  const responses = application_data || []; // Expects array of { fieldId, value }

  // Type Validation & Requirements checks
  for (const field of fields) {
    const response = responses.find(r => r.fieldId === field.field_id);
    if (field.is_required && (!response || response.value === undefined || response.value === "")) {
      throw { status: 400, message: `Field '${field.field_label}' is required.` };
    }
    if (response && response.value !== "") {
      if (field.field_type === "NUMBER" && isNaN(response.value)) {
        throw { status: 400, message: `Field '${field.field_label}' must be a numeric value.` };
      }
    }
  }

  const DynamicFormResponse = (await import("../models/dynamic_form_response.js")).default;
  const StudentApplication = (await import("../models/student_application.js")).default;

  const transaction = await sequelize.transaction();
  try {
    const application = await StudentApplication.create({
      student_id: student.student_id,
      drive_id,
      application_status: "APPLIED"
    }, { transaction });

    if (responses.length > 0) {
      const responsePayloads = responses.map(r => {
        const field = fields.find(f => f.field_id === r.fieldId);
        if (!field) return null;
        return {
          application_id: application.application_id,
          field_id: field.field_id,
          text_value: field.field_type === "TEXT" ? String(r.value) : null,
          number_value: field.field_type === "NUMBER" ? parseFloat(r.value) : null,
          file_url: field.field_type === "FILE" ? String(r.value) : null
        };
      }).filter(Boolean);

      if (responsePayloads.length > 0) {
        await DynamicFormResponse.bulkCreate(responsePayloads, { transaction });
      }
    }

    await transaction.commit();
    return application;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createDriveTransaction = async (driveData, staffId, options = {}) => {
  const {
    company_id,
    role_title,
    role_description,
    offer_type,
    package_lpa,
    deadline,
    placement_season,
    stipend_pm,
    has_bond,
    bond_months,
    has_security_deposit,
    security_deposit_amount,
    allowed_departments, 
    allowed_courses, 
    eligibility, 
    dynamic_form_fields 
  } = driveData;

  const {
    driveStatus = "Active",
    approvalStatus = "Approved",
    enforceDeptId = null,
  } = options;

  const normalizedAllowedDepartments = enforceDeptId
    ? [enforceDeptId]
    : allowed_departments;

  if (!normalizedAllowedDepartments || normalizedAllowedDepartments.length === 0) {
    throw { status: 400, message: "At least one department must be selected" };
  }
  if (!allowed_courses || allowed_courses.length === 0) {
    throw { status: 400, message: "At least one course must be selected" };
  }

  const normalizedPlacementSeason = normalizePlacementSeason(placement_season);
  const contractTerms = normalizeContractTerms({
    has_bond,
    bond_months,
    security_deposit_amount,
  });

  // Deep Validation: Check if selected courses actually belong to the selected departments
  const validCourses = await Course.findAll({
    where: { course_id: allowed_courses }
  });

  const invalidCourses = validCourses.some(c => !normalizedAllowedDepartments.includes(c.dept_id));
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
      stipend_pm,
      ...contractTerms,
      deadline,
      placement_season: normalizedPlacementSeason,
      drive_status: driveStatus,
      approval_status: approvalStatus
    }, { transaction });

    await DriveAllowedDepartment.bulkCreate(
      normalizedAllowedDepartments.map(dept_id => ({ drive_id: drive.drive_id, dept_id })),
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
      package_lpa, deadline, placement_season, drive_status, approval_status,
      stipend_pm, has_bond, bond_months, has_security_deposit, security_deposit_amount,
      allowed_departments, allowed_courses, eligibility, dynamic_form_fields
    } = driveData;

    let normalizedPlacementSeason;
    if (placement_season !== undefined && placement_season !== "") {
      normalizedPlacementSeason = normalizePlacementSeason(placement_season);
    } else {
      normalizedPlacementSeason = drive.placement_season;  // Keep existing if not provided or empty
    }

    const contractTerms = normalizeContractTerms({
      has_bond,
      bond_months,
      security_deposit_amount,
    });

    // 1. Update root Drive record
    await drive.update({
      company_id,
      role_title,
      role_description: role_description || null,
      offer_type,
      package_lpa: package_lpa || null,
      stipend_pm: stipend_pm || null,
      ...contractTerms,
      deadline,
      placement_season: normalizedPlacementSeason,
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
    await DriveDocument.destroy({ where: { drive_id }, transaction });
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

const listPendingDriveApprovals = async (deptId) => {
  const drives = await Drive.findAll({
    where: { approval_status: "Pending" },
    include: [
      { model: Company, attributes: ["company_name"] },
      {
        model: DriveAllowedDepartment,
        where: { dept_id: deptId },
        required: true,
      },
      { model: DriveAllowedCourse, required: false },
      { model: DriveEligibility, required: false },
    ],
    order: [["created_at", "DESC"]],
  });

  return drives.map((drive) => {
    const plain = drive.get({ plain: true });
    plain.company_name = plain.Company?.company_name || "Unknown Company";
    return plain;
  });
};

const updateDriveApprovalStatus = async (driveId, deptId, tpoStaffId, approvalStatus) => {
  const drive = await Drive.findOne({
    where: { drive_id: driveId, approval_status: "Pending" },
    include: [
      {
        model: DriveAllowedDepartment,
        where: { dept_id: deptId },
        required: true,
      },
    ],
  });

  if (!drive) {
    throw { status: 404, message: "Pending drive not found for your department" };
  }

  const nextDriveStatus = approvalStatus === "Approved" ? "Active" : "Draft";

  await drive.update({
    approval_status: approvalStatus,
    drive_status: nextDriveStatus,
    approved_by_staff: tpoStaffId,
    updated_at: new Date(),
  });

  return drive;
};

export default {
  listOpenDrivesForStudent,
  getStudentApplications,
  applyToDrive,
  getDriveFormFields,
  uploadDriveDocuments,
  createDriveTransaction,
  updateDriveTransaction,
  deleteDrive,
  listPendingDriveApprovals,
  updateDriveApprovalStatus
};
