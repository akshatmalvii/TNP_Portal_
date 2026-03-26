import driveService from "../services/driveService.js";
import Company from "../models/company.js";
import CompanyContact from "../models/company_contact.js";
import StaffAdmin from "../models/staff_admin.js";
import Drive from "../models/drive.js";
import DriveAllowedDepartment from "../models/drive_allowed_department.js";
import DriveAllowedCourse from "../models/drive_allowed_course.js";
import DriveEligibility from "../models/drive_eligibility.js";
import DynamicFormField from "../models/dynamic_form_field.js";
import sequelize from "../config/db.js";

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
        { model: DriveEligibility },
        { model: DynamicFormField }
      ]
    });
    if (!drive) return res.status(404).json({ error: "Drive not found" });
    res.json(drive);
  } catch (err) {
    console.error("Error fetching drive details:", err);
    res.status(500).json({ error: "Failed to fetch drive details" });
  }
};

const createDrive = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // We must map global user_id to the relational staff_id FK inside staff_admins
    const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });
    if (!staffUser) {
      return res.status(403).json({ error: "Unmapped Staff Administrator. Access Denied." });
    }
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

    const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });
    if (!staffUser) {
      return res.status(403).json({ error: "Unmapped Staff Administrator. Access Denied." });
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

    const staffUser = await StaffAdmin.findOne({ where: { user_id: userId } });
    if (!staffUser) {
      return res.status(403).json({ error: "Unmapped Staff Administrator. Access Denied." });
    }

    await driveService.deleteDrive(driveId, staffUser.staff_id);
    return res.json({ message: "Drive deleted successfully" });
  } catch (err) {
    console.error("Error deleting drive:", err);
    res.status(err.status || 500).json({ error: err.message || "Failed to delete drive" });
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
  createCompany
};
