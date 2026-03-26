import driveService from "../services/driveService.js";
import CompanyRole from "../models/company_role.js";
import Company from "../models/company.js";

const getCompanyRoles = async (req, res) => {
  try {
    const roles = await CompanyRole.findAll({
      include: [{ model: Company, attributes: ["company_name"] }]
    });
    res.json(roles);
  } catch (err) {
    console.error("Error fetching company roles:", err);
    res.status(500).json({ error: "Failed to fetch company roles" });
  }
};

const createDrive = async (req, res) => {
  try {
    const staffId = req.user.user_id; // from JWT payload (usually user_id for Staff)
    const driveData = req.body;
    
    if (!driveData.company_role_id || !driveData.deadline) {
      return res.status(400).json({ error: "company_role_id and deadline are required" });
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

export default {
  createDrive,
  getCompanyRoles
};
