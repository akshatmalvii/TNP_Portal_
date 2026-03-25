import studentProfileService from "../services/studentProfileService.js";
import Student from "../models/student.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await studentProfileService.getProfile(req.user.user_id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const student = await studentProfileService.updateProfile(req.user.user_id, req.body);
    res.json(student);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const edu = await studentProfileService.addEducation(student.student_id, req.body);
    res.status(201).json(edu);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const result = await studentProfileService.deleteEducation(req.params.id, student.student_id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const doc = await studentProfileService.uploadDocument(
      student.student_id,
      req.file,
      req.body.document_type
    );
    res.status(201).json(doc);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const result = await studentProfileService.deleteDocument(req.params.id, student.student_id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const submitForVerification = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const request = await studentProfileService.submitForVerification(student.student_id);
    res.status(201).json(request);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
