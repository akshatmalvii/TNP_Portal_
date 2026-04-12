import driveService from "../services/driveService.js";
import adminService from "../services/adminService.js";
import reportService from "../services/reportService.js";
import Company from "../models/company.js";
import CompanyContact from "../models/company_contact.js";
import StaffAdmin from "../models/staff_admin.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import DriveDocument from "../models/drive_document.js";
import DriveEligibility from "../models/drive_eligibility.js";
import DynamicFormField from "../models/dynamic_form_field.js";
import sequelize from "../config/db.js";
import { getSignedCloudinaryDownloadUrl } from "../utils/cloudinaryFileUrl.js";
import departmentPolicyService from "../services/departmentPolicyService.js";
import { normalizePlacementSeason } from "../utils/placementSeason.js";

const getStaffContext = async (userId) => {
  const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });
  if (!staffUser) {
    throw { status: 403, message: "Unmapped Staff Administrator. Access Denied." };
  }

  return staffUser;
};

const parseOptionalCourseId = (courseId) => {
  if (courseId === undefined || courseId === null || courseId === "") {
    return null;
  }

  const parsedCourseId = Number.parseInt(courseId, 10);
  if (Number.isNaN(parsedCourseId)) {
    throw { status: 400, message: "Invalid course_id" };
  }

  return parsedCourseId;
};

const parseRequiredDepartmentId = (deptId) => {
  const parsedDeptId = Number.parseInt(deptId, 10);
  if (Number.isNaN(parsedDeptId)) {
    throw { status: 400, message: "dept_id is required" };
  }

  return parsedDeptId;
};

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

const getCourses = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const courses = await Course.findAll({
      where: { dept_id: staffUser.dept_id },
    });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

const getDrives = async (req, res) => {
  try {
    const drives = await Drive.findAll({
      attributes: ['drive_id', 'company_id', 'role_title', 'role_description', 'offer_type', 'package_lpa', 'deadline', 'placement_season', 'drive_status', 'approval_status', 'created_at'],
      include: [{ model: Company, attributes: ["company_name"] }],
      order: [["created_at", "DESC"]]
    });
    
    // Map underlying Company association so frontend mapping stays consistent
    const mappedDrives = drives.map(d => {
      const plain = d.get({ plain: true });
      plain.company_name = plain.Company?.company_name || "Unknown Company";
      return plain;
    });

    res.json(mappedDrives);
  } catch (err) {
    console.error("Error fetching TPO drives:", err);
    res.status(500).json({ error: "Failed to fetch drives" });
  }
};

const getDrive = async (req, res) => {
  try {
    const drive = await Drive.findByPk(req.params.id, {
      include: [
        { model: DriveAllowedDepartment },
        { model: DriveAllowedCourse },
        { model: DriveDocument },
        { model: DriveEligibility },
        { model: DynamicFormField }
      ]
    });
    if (!drive) return res.status(404).json({ error: "Drive not found" });

    const plainDrive = drive.get({ plain: true });
    plainDrive.DriveDocuments = (plainDrive.DriveDocuments || []).map((document) => ({
      ...document,
      view_url: getSignedCloudinaryDownloadUrl(document.file_url),
    }));

    res.json(plainDrive);
  } catch (err) {
    console.error("Error fetching drive details:", err);
    res.status(500).json({ error: "Failed to fetch drive details" });
  }
};

const getPendingDriveApprovals = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const drives = await driveService.listPendingDriveApprovals(staffUser.dept_id);
    return res.json(drives);
  } catch (err) {
    console.error("Error fetching pending drive approvals:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch pending drive approvals" });
  }
};

const approveDrive = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const drive = await driveService.updateDriveApprovalStatus(
      req.params.id,
      staffUser.dept_id,
      staffUser.staff_id,
      "Approved"
    );
    return res.json({
      message: "Drive approved and published successfully",
      drive,
    });
  } catch (err) {
    console.error("Error approving drive:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to approve drive" });
  }
};

const rejectDriveApproval = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const drive = await driveService.updateDriveApprovalStatus(
      req.params.id,
      staffUser.dept_id,
      staffUser.staff_id,
      "Rejected"
    );
    return res.json({
      message: "Drive approval rejected",
      drive,
    });
  } catch (err) {
    console.error("Error rejecting drive approval:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to reject drive approval" });
  }
};

const uploadDriveDocuments = async (req, res) => {
  try {
    const driveId = req.params.id;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: "At least one PDF must be selected" });
    }

    const uploadedDocuments = await driveService.uploadDriveDocuments(driveId, files);
    return res.status(201).json({
      message: "Drive documents uploaded successfully",
      documents: uploadedDocuments,
    });
  } catch (err) {
    console.error("Error uploading drive documents:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to upload drive documents" });
  }
};

const createDrive = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const staffUser = await getStaffContext(userId);
    const staffId = staffUser.staff_id;

    const department = await Department.findByPk(staffUser.dept_id, {
      attributes: ["dept_id", "current_placement_season"],
    });

    if (!department?.current_placement_season) {
      return res.status(400).json({
        error:
          "The current placement season must be set before creating drives.",
      });
    }

    const driveData = {
      ...req.body,
      placement_season: department.current_placement_season,
    };
    
    if (!driveData.company_id || !driveData.role_title || !driveData.deadline) {
      return res.status(400).json({ error: "company_id, role_title, and deadline are required" });
    }

    const drive = await driveService.createDriveTransaction(driveData, staffId);
    
    return res.status(201).json({
      message: "Drive created successfully",
      drive
    });
  } catch (err) {
    console.error("Error in createDrive:", err);
    const status = err.status || 500;
    const message = err.message || "Failed to create drive";
    res.status(status).json({ error: message });
  }
};

const updateDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const userId = req.user.user_id;
    const staffUser = await getStaffContext(userId);

    // If placement_season not provided and drive doesn't have one, set from department
    if (!req.body.placement_season) {
      const existingDrive = await Drive.findByPk(driveId, {
        attributes: ["placement_season"]
      });
      if (!existingDrive?.placement_season) {
        const department = await Department.findByPk(staffUser.dept_id, {
          attributes: ["current_placement_season"],
        });
        if (department?.current_placement_season) {
          req.body.placement_season = department.current_placement_season;
        }
      }
    }

    const drive = await driveService.updateDriveTransaction(driveId, req.body, staffUser.staff_id);
    return res.json({ message: "Drive updated successfully", drive });
  } catch (err) {
    console.error("Error updating drive:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to update drive" });
  }
};

const deleteDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const userId = req.user.user_id;
    const staffUser = await getStaffContext(userId);

    await driveService.deleteDrive(driveId, staffUser.staff_id);
    return res.json({ message: "Drive deleted successfully" });
  } catch (err) {
    console.error("Error deleting drive:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to delete drive" });
  }
};

const getCoordinators = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const coordinators = await adminService.getCoordinatorsByDepartment(staffUser.dept_id);
    return res.json(coordinators);
  } catch (err) {
    console.error("Error fetching coordinators:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch coordinators" });
  }
};

const createCoordinator = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const coordinator = await adminService.createCoordinatorForDepartment({
      email: req.body.email,
      password: req.body.password,
      dept_id: staffUser.dept_id,
    });
    return res.status(201).json(coordinator);
  } catch (err) {
    console.error("Error creating coordinator:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to create coordinator" });
  }
};

const deleteCoordinator = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const result = await adminService.deleteCoordinatorForDepartment(req.params.staff_id, staffUser.dept_id);
    return res.json(result);
  } catch (err) {
    console.error("Error deleting coordinator:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to delete coordinator" });
  }
};

const updateCoordinatorStatus = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const coordinator = await adminService.updateCoordinatorStatusForDepartment(
      req.params.staff_id,
      staffUser.dept_id,
      req.body.account_status
    );
    return res.json(coordinator);
  } catch (err) {
    console.error("Error updating coordinator status:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to update coordinator status" });
  }
};

const getDepartmentPolicy = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const policy = await departmentPolicyService.getCurrentDepartmentPolicy(staffUser.dept_id);
    return res.json(policy);
  } catch (err) {
    console.error("Error fetching department policy:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch department policy" });
  }
};

const getDepartmentPolicyHistory = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const history = await departmentPolicyService.getDepartmentPolicyHistory(staffUser.dept_id);
    return res.json(history);
  } catch (err) {
    console.error("Error fetching department policy history:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch department policy history" });
  }
};

const updateDepartmentPolicy = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const policy = await departmentPolicyService.setDepartmentPolicy(
      staffUser.dept_id,
      staffUser.staff_id,
      req.body
    );
    return res.json({
      message: "Department policy updated successfully",
      ...policy,
    });
  } catch (err) {
    console.error("Error updating department policy:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to update department policy" });
  }
};

const getPlacementSeason = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const department = await Department.findByPk(staffUser.dept_id, {
      attributes: ["dept_id", "dept_code", "dept_name", "current_placement_season"],
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    return res.json({
      dept_id: department.dept_id,
      dept_code: department.dept_code,
      dept_name: department.dept_name,
      current_placement_season: department.current_placement_season || null,
    });
  } catch (err) {
    console.error("Error fetching placement season:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch placement season" });
  }
};

const setPlacementSeason = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const { placement_season } = req.body;

    if (!placement_season) {
      return res.status(400).json({ error: "placement_season is required" });
    }

    const normalizedSeason = normalizePlacementSeason(placement_season);

    const department = await Department.findByPk(staffUser.dept_id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.update({ current_placement_season: normalizedSeason });

    return res.json({
      message: "Placement season updated successfully",
      current_placement_season: normalizedSeason,
      dept_id: department.dept_id,
      dept_name: department.dept_name,
    });
  } catch (err) {
    console.error("Error setting placement season:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to set placement season" });
  }
};

const createCompany = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const department = await Department.findByPk(staffUser.dept_id, {
      attributes: ["dept_id", "current_placement_season"],
      transaction: t,
    });

    const { company_name, company_website, contacts } = req.body;

    if (!company_name) {
      await t.rollback();
      return res.status(400).json({ error: "company_name is required" });
    }

    if (!department?.current_placement_season) {
      await t.rollback();
      return res.status(400).json({
        error:
          "The current placement season must be set before creating companies.",
      });
    }

    // Check for duplicates
    const existing = await Company.findOne({ where: { company_name }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: "Company with this name already exists" });
    }

    // Insert Company
    const newCompany = await Company.create({
      company_name,
      company_website: company_website || null,
      placement_season: department.current_placement_season,
    }, { transaction: t });

    // Insert Contacts
    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactPayloads = contacts.map(c => ({
        company_id: newCompany.company_id,
        contact_name: c.name || null,
        contact_email: c.email || null,
        contact_phone: c.phone || null,
        designation: c.designation || null
      }));
      await CompanyContact.bulkCreate(contactPayloads, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (err) {
    await t.rollback();
    console.error("Error creating company:", err);
    res.status(500).json({ error: "Failed to create company" });
  }
};

const getReportSeasons = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const seasons = await reportService.getAvailableSeasons(staffUser.dept_id);
    res.json(seasons);
  } catch (err) {
    console.error("Error fetching report seasons:", err);
    res.status(500).json({ error: "Failed to fetch report seasons" });
  }
};

const getHeadReportSeasons = async (req, res) => {
  try {
    const deptId = req.query.dept_id ? parseRequiredDepartmentId(req.query.dept_id) : null;
    const seasons = await reportService.getAvailableSeasons(deptId);
    res.json(seasons);
  } catch (err) {
    console.error("Error fetching TPO Head report seasons:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch report seasons" });
  }
};

const getPlacementReport = async (req, res) => {
  try {
    const { season } = req.params;
    const courseId = parseOptionalCourseId(req.query.course_id);
    const staffUser = await getStaffContext(req.user.user_id);
    const report = await reportService.getPlacementReport(staffUser.dept_id, season, {
      course_id: courseId,
    });
    res.json(report);
  } catch (err) {
    console.error("Error fetching placement report:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch placement report" });
  }
};

const downloadPlacementReport = async (req, res) => {
  try {
    const { season } = req.params;
    const courseId = parseOptionalCourseId(req.query.course_id);
    const staffUser = await getStaffContext(req.user.user_id);
    const report = await reportService.getPlacementReport(staffUser.dept_id, season, {
      course_id: courseId,
    });
    const workbookBuffer = reportService.buildPlacementReportWorkbook(report);
    const safeSeason = String(season || "report").replace(/[^a-zA-Z0-9_-]+/g, "-");
    const safeDepartment = String(report.department?.dept_code || report.department?.dept_name || "department").replace(/[^a-zA-Z0-9_-]+/g, "-");
    const safeCourse = String(report.course?.course_name || "all-courses").replace(/[^a-zA-Z0-9_-]+/g, "-");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="placement-report-${safeDepartment}-${safeCourse}-${safeSeason}.xlsx"`
    );

    res.send(workbookBuffer);
  } catch (err) {
    console.error("Error downloading placement report:", err);
    res.status(500).json({ error: "Failed to download placement report" });
  }
};

const getHeadPlacementReport = async (req, res) => {
  try {
    const { season } = req.params;
    const deptId = parseRequiredDepartmentId(req.query.dept_id);
    const courseId = parseOptionalCourseId(req.query.course_id);
    const report = await reportService.getPlacementReport(deptId, season, {
      course_id: courseId,
    });
    res.json(report);
  } catch (err) {
    console.error("Error fetching TPO Head placement report:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch placement report" });
  }
};

const downloadHeadPlacementReport = async (req, res) => {
  try {
    const { season } = req.params;
    const deptId = parseRequiredDepartmentId(req.query.dept_id);
    const courseId = parseOptionalCourseId(req.query.course_id);
    const report = await reportService.getPlacementReport(deptId, season, {
      course_id: courseId,
    });
    const workbookBuffer = reportService.buildPlacementReportWorkbook(report);
    const safeSeason = String(season || "report").replace(/[^a-zA-Z0-9_-]+/g, "-");
    const safeDepartment = String(report.department?.dept_code || report.department?.dept_name || "department").replace(/[^a-zA-Z0-9_-]+/g, "-");
    const safeCourse = String(report.course?.course_name || "all-courses").replace(/[^a-zA-Z0-9_-]+/g, "-");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="placement-report-${safeDepartment}-${safeCourse}-${safeSeason}.xlsx"`
    );

    res.send(workbookBuffer);
  } catch (err) {
    console.error("Error downloading TPO Head placement report:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to download placement report" });
  }
};

const getOfferLetters = async (req, res) => {
  try {
    const staffUser = await getStaffContext(req.user.user_id);
    const letters = await reportService.getSubmittedOfferLetters(staffUser.dept_id, {
      season: req.query.season || null,
      course_id: req.query.course_id || null,
    });
    res.json(letters);
  } catch (err) {
    console.error("Error fetching offer letters:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to fetch offer letters" });
  }
};

export default {
  createDrive,
  updateDrive,
  deleteDrive,
  getCompanies,
  getCourses,
  getDrives,
  getDrive,
  getPendingDriveApprovals,
  approveDrive,
  rejectDriveApproval,
  uploadDriveDocuments,
  getCoordinators,
  createCoordinator,
  deleteCoordinator,
  updateCoordinatorStatus,
  getDepartmentPolicy,
  getDepartmentPolicyHistory,
  updateDepartmentPolicy,
  createCompany,
  getPlacementSeason,
  setPlacementSeason,
  getReportSeasons,
  getHeadReportSeasons,
  getPlacementReport,
  getHeadPlacementReport,
  downloadPlacementReport,
  downloadHeadPlacementReport,
  getOfferLetters
};
