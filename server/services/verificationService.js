import Student from "../models/student.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import StudentDocument from "../models/student_document.js";
import StudentEducation from "../models/student_education.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import sequelize from "../config/db.js";
import { generateTnpId } from "../utils/tnpIdGenerator.js";

// Get all students pending coordinator verification (in coordinator's department)
const getCoordinatorPending = async (dept_id) => {
  return await Student.findAll({
    where: { dept_id },
    include: [
      {
        model: StudentVerificationRequest,
        where: { coordinator_status: "Pending" },
        required: true,
      },
      { model: Department, attributes: ["dept_id", "dept_code", "dept_name"] },
      { model: Course, attributes: ["course_id", "course_name"] },
      { model: StudentDocument },
      { model: StudentEducation },
    ],
  });
};

// Get all students (all statuses) for coordinator's department
const getCoordinatorAll = async (dept_id) => {
  return await Student.findAll({
    where: { dept_id },
    include: [
      { model: StudentVerificationRequest, required: false },
      { model: Department, attributes: ["dept_id", "dept_code", "dept_name"] },
      { model: Course, attributes: ["course_id", "course_name"] },
    ],
  });
};

// Coordinator approves student → generates TNP ID
const verifyByCoordinator = async (student_id, staff_id) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({
      where: { student_id, coordinator_status: "Pending" },
      transaction: t,
    });

    if (!req) {
      throw { status: 404, message: "No pending verification request found for this student" };
    }

    const student = await Student.findOne({ where: { student_id }, transaction: t });
    if (!student) throw { status: 404, message: "Student not found" };

    // Generate TNP ID on approval
    const tnp_id = await generateTnpId(student.dept_id);

    // Update student
    student.tnp_id = tnp_id;
    student.updated_at = new Date();
    await student.save({ transaction: t });

    // Update verification request
    req.coordinator_status = "Approved";
    req.verified_by_coordinator = staff_id;
    req.updated_at = new Date();
    await req.save({ transaction: t });

    return { message: "Student verified successfully", tnp_id };
  });
};

// Coordinator rejects student
const rejectByCoordinator = async (student_id, staff_id, reason) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({
      where: { student_id, coordinator_status: "Pending" },
      transaction: t,
    });

    if (!req) {
      throw { status: 404, message: "No pending verification request found for this student" };
    }

    req.coordinator_status = "Rejected";
    req.verified_by_coordinator = staff_id;
    req.updated_at = new Date();
    await req.save({ transaction: t });

    return { message: "Student verification rejected" };
  });
};

export default {
  getCoordinatorPending,
  getCoordinatorAll,
  verifyByCoordinator,
  rejectByCoordinator,
};
