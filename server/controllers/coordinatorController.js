import coordinatorDriveService from "../services/coordinatorDriveService.js";
import driveService from "../services/driveService.js";
import StaffAdmin from "../models/staff_admin.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import Company from "../models/company.js";
import CompanyContact from "../models/company_contact.js";
import sequelize from "../config/db.js";

const getCoordinatorContext = async (req, res) => {
  try {
    const staffUser = await StaffAdmin.findOne({
      where: { user_id: req.user.user_id },
      include: [{ model: Department, attributes: ["dept_id", "dept_code", "dept_name", "current_placement_season"] }],
    });

    if (!staffUser) {
      return res.status(404).json({ error: "Coordinator context not found" });
    }

    return res.json({
      staff_id: staffUser.staff_id,
      dept_id: staffUser.dept_id,
      Department: staffUser.Department,
      current_placement_season: staffUser.Department?.current_placement_season || null,
    });
  } catch (err) {
    console.error("Error fetching coordinator context:", err);
    return res.status(500).json({ error: "Failed to fetch coordinator context" });
  }
};

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    return res.json(companies);
  } catch (err) {
    console.error("Error fetching companies for coordinator:", err);
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
};

const getCourses = async (req, res) => {
  try {
    const staffUser = await StaffAdmin.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!staffUser?.dept_id) {
      return res.status(400).json({ error: "Department not found" });
    }

    const courses = await Course.findAll({
      where: { dept_id: staffUser.dept_id },
    });

    return res.json(courses);
  } catch (err) {
    console.error("Error fetching courses for coordinator:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch courses" });
  }
};

const createCompany = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const staffUser = await StaffAdmin.findOne({
      where: { user_id: req.user.user_id },
      transaction: t,
    });

    if (!staffUser?.dept_id) {
      await t.rollback();
      return res.status(400).json({ error: "Coordinator department not found" });
    }

    const department = await Department.findByPk(staffUser.dept_id, {
      attributes: ["dept_id", "current_placement_season"],
      transaction: t,
    });

    if (!department?.current_placement_season) {
      await t.rollback();
      return res.status(400).json({
        error:
          "The current placement season must be set by TPO before creating companies.",
      });
    }

    const { company_name, company_website, contacts } = req.body;

    if (!company_name) {
      await t.rollback();
      return res.status(400).json({ error: "company_name is required" });
    }

    const existing = await Company.findOne({ where: { company_name }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: "Company with this name already exists" });
    }

    const newCompany = await Company.create({
      company_name,
      company_website: company_website || null,
      placement_season: department.current_placement_season,
    }, { transaction: t });

    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactPayloads = contacts.map((c) => ({
        company_id: newCompany.company_id,
        contact_name: c.name || null,
        contact_email: c.email || null,
        contact_phone: c.phone || null,
        designation: c.designation || null,
      }));

      await CompanyContact.bulkCreate(contactPayloads, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (err) {
    await t.rollback();
    console.error("Error creating company for coordinator:", err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to create company" });
  }
};

const listDrives = async (req, res) => {
  try {
    const drives = await coordinatorDriveService.listCoordinatorDrives(
      req.user.user_id
    );
    return res.json(drives);
  } catch (err) {
    console.error("Error fetching coordinator drives:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch drives" });
  }
};

const getDriveProcess = async (req, res) => {
  try {
    const process = await coordinatorDriveService.getDriveProcess(
      req.user.user_id,
      req.params.drive_id
    );
    return res.json(process);
  } catch (err) {
    console.error("Error fetching drive process:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to fetch drive process" });
  }
};

const createRound = async (req, res) => {
  try {
    const result = await coordinatorDriveService.createDriveRound(
      req.user.user_id,
      req.params.drive_id,
      req.body
    );
    return res.status(201).json({
      message: "Round created and notifications sent successfully",
      ...result,
    });
  } catch (err) {
    console.error("Error creating drive round:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to create round" });
  }
};

const uploadRoundResults = async (req, res) => {
  try {
    const result = await coordinatorDriveService.processRoundResults(
      req.user.user_id,
      req.params.drive_id,
      req.params.round_id,
      req.file
    );
    return res.json({
      message: "Round results processed successfully",
      ...result,
    });
  } catch (err) {
    console.error("Error processing round results:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to process round results" });
  }
};

const createDrive = async (req, res) => {
  try {
    const staffUser = await StaffAdmin.findOne({
      where: { user_id: req.user.user_id },
    });

    if (!staffUser?.dept_id) {
      return res.status(400).json({ error: "Coordinator department not found" });
    }

    const department = await Department.findByPk(staffUser.dept_id, {
      attributes: ["dept_id", "current_placement_season"],
    });

    if (!department?.current_placement_season) {
      return res.status(400).json({
        error:
          "The current placement season must be set by TPO before creating drives.",
      });
    }

    const driveData = {
      ...req.body,
      placement_season: department.current_placement_season,
    };

    const drive = await driveService.createDriveTransaction(
      driveData,
      staffUser.staff_id,
      {
        driveStatus: "Draft",
        approvalStatus: "Pending",
        enforceDeptId: staffUser.dept_id,
      }
    );

    return res.status(201).json({
      message: "Drive created and sent for TPO approval",
      drive,
    });
  } catch (err) {
    console.error("Error creating coordinator drive:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to create drive" });
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
    console.error("Error uploading drive documents for coordinator:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to upload drive documents" });
  }
};

export default {
  getCoordinatorContext,
  listCompanies,
  getCourses,
  listDrives,
  getDriveProcess,
  createRound,
  uploadRoundResults,
  createDrive,
  createCompany,
  uploadDriveDocuments,
};
