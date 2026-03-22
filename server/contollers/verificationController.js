import verificationService from "../services/verificationService.js";
import StaffAdmin from "../models/staff_admin.js";

// Helper to get staff's true staff_id and dept_id
const getStaffContext = async (user_id) => {
    const staff = await StaffAdmin.findOne({ where: { user_id } });
    if (!staff) throw { status: 403, message: "Staff profile not found" };
    return staff;
};

export const getCoordinatorPending = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const students = await verificationService.getCoordinatorPending(staff.dept_id);
    res.json(students);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const verifyByCoordinator = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const result = await verificationService.verifyByCoordinator(req.params.student_id, staff.staff_id);
    res.json(result);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const rejectByCoordinator = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const result = await verificationService.rejectByCoordinator(req.params.student_id, staff.staff_id);
    res.json(result);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getTpoPending = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const students = await verificationService.getTpoPending(staff.dept_id);
    res.json(students);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const approveByTpo = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const result = await verificationService.approveByTpo(req.params.student_id, staff.staff_id);
    res.json(result);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const rejectByTpo = async (req, res) => {
  try {
    const staff = await getStaffContext(req.user.user_id);
    const result = await verificationService.rejectByTpo(req.params.student_id, staff.staff_id);
    res.json(result);
  } catch(err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
