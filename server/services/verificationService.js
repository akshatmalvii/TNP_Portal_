import Student from "../models/student.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import StaffAdmin from "../models/staff_admin.js";
import sequelize from "../config/db.js";
import { generateTnpId } from "../utils/tnpIdGenerator.js";

const getCoordinatorPending = async (dept_id) => {
  return await Student.findAll({
    where: { dept_id },
    include: [{
      model: StudentVerificationRequest,
      where: { verification_status: "PENDING_COORDINATOR" },
      required: true
    }]
  });
};

const verifyByCoordinator = async (student_id, staff_id) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({ 
      where: { student_id, verification_status: "PENDING_COORDINATOR" },
      transaction: t
    });

    if (!req) {
      throw { status: 404, message: "No pending coordinator verification request found for this student" };
    }

    req.verification_status = "PENDING_TPO";
    req.verified_by_coordinator = staff_id;
    await req.save({ transaction: t });

    return { message: "Student verified by Coordinator, pending TPO approval" };
  });
};

const getTpoPending = async (dept_id) => {
  return await Student.findAll({
    where: { dept_id },
    include: [{
      model: StudentVerificationRequest,
      where: { verification_status: "PENDING_TPO" },
      required: true
    }]
  });
};

const approveByTpo = async (student_id, staff_id) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({ 
      where: { student_id, verification_status: "PENDING_TPO" },
      transaction: t
    });

    if (!req) {
      throw { status: 404, message: "No pending TPO verification request found for this student" };
    }

    const student = await Student.findOne({ where: { student_id }, transaction: t });
    if (!student) throw { status: 404, message: "Student not found" };

    // Generate TNP ID
    const tnp_id = await generateTnpId(student.dept_id);

    // Update Student
    student.is_verified = true;
    student.tnp_id = tnp_id;
    student.verified_at = new Date();
    await student.save({ transaction: t });

    // Update Verification Request
    req.verification_status = "APPROVED";
    req.approved_by_tpo = staff_id;
    await req.save({ transaction: t });

    return { message: "Student approved", tnp_id };
  });
};

const rejectByCoordinator = async (student_id, staff_id) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({ 
      where: { student_id, verification_status: "PENDING_COORDINATOR" },
      transaction: t
    });

    if (!req) {
      throw { status: 404, message: "No pending coordinator verification request found for this student" };
    }

    req.verification_status = "REJECTED";
    req.verified_by_coordinator = staff_id;
    await req.save({ transaction: t });

    return { message: "Student rejected by Coordinator" };
  });
};

const rejectByTpo = async (student_id, staff_id) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({ 
      where: { student_id, verification_status: "PENDING_TPO" },
      transaction: t
    });

    if (!req) {
      throw { status: 404, message: "No pending TPO verification request found for this student" };
    }

    req.verification_status = "REJECTED";
    req.approved_by_tpo = staff_id;
    await req.save({ transaction: t });

    return { message: "Student rejected by TPO" };
  });
};

export default {
  getCoordinatorPending,
  verifyByCoordinator,
  rejectByCoordinator,
  getTpoPending,
  approveByTpo,
  rejectByTpo
};
