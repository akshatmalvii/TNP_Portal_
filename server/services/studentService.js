import Student from "../models/student.js";
import Department from "../models/department.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import sequelize from "../config/db.js";

const getMyProfile = async (user_id) => {
  const student = await Student.findOne({
    where: { user_id },
    include: [{ model: Department, attributes: ["dept_id", "dept_name", "dept_code"] }]
  });
  return student; // Null if not found
};

const createProfile = async (user_id, data) => {
  return await sequelize.transaction(async (t) => {
    // Check if profile exists
    const existingStudent = await Student.findOne({ where: { user_id }, transaction: t });
    let student;

    if (existingStudent) {
      // Check verification status
      const req = await StudentVerificationRequest.findOne({ 
        where: { student_id: existingStudent.student_id },
        order: [["created_at", "DESC"]],
        transaction: t
      });

      if (req && req.verification_status === "APPROVED") {
        throw { status: 400, message: "Profile already approved, cannot update" };
      }

      // Update existing student
      existingStudent.dept_id = data.dept_id;
      existingStudent.cgpa = data.cgpa;
      existingStudent.backlogs = data.backlogs;
      existingStudent.resume_url = data.resume_url;
      existingStudent.name = data.name || existingStudent.name;
      existingStudent.verification_requested_at = new Date();
      await existingStudent.save({ transaction: t });
      student = existingStudent;

      // Update or create new verification request
      if (req) {
        req.verification_status = "PENDING_COORDINATOR";
        req.verified_by_coordinator = null;
        req.approved_by_tpo = null;
        await req.save({ transaction: t });
      } else {
        await StudentVerificationRequest.create({
          student_id: student.student_id,
          verification_status: "PENDING_COORDINATOR"
        }, { transaction: t });
      }
    } else {
      // Create new student
      student = await Student.create({
        user_id,
        dept_id: data.dept_id,
        cgpa: data.cgpa,
        backlogs: data.backlogs,
        resume_url: data.resume_url,
        name: data.name || "Unknown",
        is_verified: false,
        verification_requested_at: new Date()
      }, { transaction: t });

      // Create Verification Request
      await StudentVerificationRequest.create({
        student_id: student.student_id,
        verification_status: "PENDING_COORDINATOR"
      }, { transaction: t });
    }

    return student;
  });
};

const getVerificationStatus = async (user_id) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) {
    return { status: "PROFILE_NOT_CREATED" };
  }

  const req = await StudentVerificationRequest.findOne({ 
    where: { student_id: student.student_id },
    order: [["created_at", "DESC"]]
  });

  if (!req) {
    return { status: "NOT_REQUESTED" };
  }

  return { status: req.verification_status };
};

export default {
  getMyProfile,
  createProfile,
  getVerificationStatus
};