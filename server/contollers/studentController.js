import studentService from "../services/studentService.js";

export const getMe = async (req, res) => {
  try {
    const student = await studentService.getMyProfile(req.user.user_id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to fetch profile" });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const status = await studentService.getVerificationStatus(req.user.user_id);
    return res.json(status);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Failed to get verification status" });
  }
};
