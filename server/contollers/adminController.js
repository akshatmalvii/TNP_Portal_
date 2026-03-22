import adminService from "../services/adminService.js";

export const createStaff = async (req, res) => {
  try {
    const staff = await adminService.createStaff(req.body);
    res.status(201).json(staff);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const staff = await adminService.updateStaff(req.params.id, req.body);
    res.json(staff);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const result = await adminService.deleteStaff(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getAllStaff = async (req, res) => {
  try {
    const staffList = await adminService.getAllStaff();
    res.json(staffList);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
