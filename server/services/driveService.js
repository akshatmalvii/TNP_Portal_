import driveRepository from "../repositories/driveRepository.js";
import studentApplicationRepository from "../repositories/studentApplicationRepository.js";
import Student from "../models/student.js";

const listOpenDrivesForStudent = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  const drives = await driveRepository.findOpenForDept(student.dept_id);
  return drives;
};

const getStudentApplications = async (student_id) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  return studentApplicationRepository.findByStudent(student.student_id);
};

const applyToDrive = async (student_id, drive_id, application_data = null) => {
  const student = await Student.findOne({ where: { user_id: student_id } });
  if (!student) {
    throw { status: 404, message: "Student profile not found" };
  }

  if (!student.is_verified) {
    throw { status: 403, message: "Student verification required before applying to drives" };
  }

  const existing = await studentApplicationRepository.findByStudentAndDrive(student.student_id, drive_id);
  if (existing) {
    throw { status: 400, message: "Already applied to this drive" };
  }

  return studentApplicationRepository.create({
    student_id: student.student_id,
    drive_id,
    application_data,
    application_status: "APPLIED"
  });
};

export default {
  listOpenDrivesForStudent,
  getStudentApplications,
  applyToDrive
};