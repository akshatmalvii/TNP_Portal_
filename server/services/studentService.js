import Student from "../models/student.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import StudentVerificationRequest from "../models/student_verification_request.js";

const getMyProfile = async (user_id) => {
  const student = await Student.findOne({
    where: { user_id },
    include: [
      { model: Department, attributes: ["dept_id", "dept_name", "dept_code"] },
      { model: Course, attributes: ["course_id", "course_name"] },
      { model: StudentVerificationRequest, required: false },
    ],
  });
  return student; // null if not found
};

const getVerificationStatus = async (user_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) {
    return { status: "PROFILE_NOT_CREATED" };
  }

  const req = await StudentVerificationRequest.findOne({
    where: { student_id: student.student_id },
    order: [["created_at", "DESC"]],
  });

  if (!req) {
    return { status: "NOT_SUBMITTED" };
  }

  return {
    status: req.coordinator_status, // "Pending" | "Approved" | "Rejected"
    coordinator_status: req.coordinator_status,
  };
};

export default {
  getMyProfile,
  getVerificationStatus,
};