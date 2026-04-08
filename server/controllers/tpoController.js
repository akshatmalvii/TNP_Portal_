import driveService from "../services/driveService.js";
import adminService from "../services/adminService.js";
import Company from "../models/company.js";
import CompanyContact from "../models/company_contact.js";
import StaffAdmin from "../models/staff_admin.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import DriveDocument from "../models/drive_document.js";
import DriveEligibility from "../models/drive_eligibility.js";
import DynamicFormField from "../models/dynamic_form_field.js";
import sequelize from "../config/db.js";
import { getSignedCloudinaryDownloadUrl } from "../utils/cloudinaryFileUrl.js";

const getStaffContext = async (userId) => {
  const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });
  if (!staffUser) {
    throw { status: 403, message: "Unmapped Staff Administrator. Access Denied." };
  }

  return staffUser;
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

const getDrives = async (req, res) => {
  try {
    const drives = await Drive.findAll({
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

    const driveData = req.body;
    
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

const createCompany = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { company_name, company_website, contacts } = req.body;

    if (!company_name) {
      await t.rollback();
      return res.status(400).json({ error: "company_name is required" });
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
      company_website: company_website || null
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

    // Attempt to log audit trail natively (Silently) if AuditLog exists
    try {
      const AuditLog = (await import("../models/audit_log.js")).default;
      if (AuditLog) {
        await AuditLog.create({
          user_id: req.user.user_id,
          action_type: "CREATE_COMPANY",
          entity_name: "companies",
          entity_id: newCompany.company_id,
          old_values: null,
          new_values: { company_name, company_website },
          ip_address: req.ip || null
        }, { transaction: t });
      }
    } catch (e) {
      // Ignore if audit log fails or doesn't exist
    }

    await t.commit();
    res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (err) {
    await t.rollback();
    console.error("Error creating company:", err);
    res.status(500).json({ error: "Failed to create company" });
  }
};

export default {
  createDrive,
  updateDrive,
  deleteDrive,
  getCompanies,
  getDrives,
  getDrive,
  uploadDriveDocuments,
  getCoordinators,
  createCoordinator,
  deleteCoordinator,
  updateCoordinatorStatus,
  createCompany
};
