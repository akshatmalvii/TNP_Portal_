import Student from "../models/student.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import StudentDocument from "../models/student_document.js";
import StudentEducation from "../models/student_education.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import sequelize from "../config/db.js";
import cloudinary from "../config/cloudinaryConfig.js";

const getSignedCloudinaryUrl = (fileUrl) => {
  if (!fileUrl) return fileUrl;

  try {
    const parsedUrl = new URL(fileUrl);
    if (!parsedUrl.hostname.includes("res.cloudinary.com")) {
      return fileUrl;
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = pathSegments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1 || uploadIndex < 1) {
      return fileUrl;
    }

    const resource_type = pathSegments[uploadIndex - 1];
    const versionSegment = pathSegments[uploadIndex + 1];
    const hasVersion = versionSegment?.startsWith("v");
    const assetSegments = pathSegments.slice(uploadIndex + (hasVersion ? 2 : 1));

    if (assetSegments.length === 0) {
      return fileUrl;
    }

    const assetPath = assetSegments.join("/");
    const extensionIndex = assetPath.lastIndexOf(".");
    const public_id = extensionIndex === -1 ? assetPath : assetPath.slice(0, extensionIndex);
    const format = extensionIndex === -1 ? undefined : assetPath.slice(extensionIndex + 1);

    if (!format) {
      return fileUrl;
    }

    return cloudinary.utils.private_download_url(public_id, format, {
      resource_type,
      type: "upload",
      attachment: false,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
  } catch {
    return fileUrl;
  }
};

const attachSignedDocumentUrls = (students) =>
  students.map((student) => {
    const plainStudent = student.get({ plain: true });

    plainStudent.StudentDocuments = (plainStudent.StudentDocuments || []).map((document) => ({
      ...document,
      view_url: getSignedCloudinaryUrl(document.file_url),
    }));

    return plainStudent;
  });

// Get all students pending coordinator verification (in coordinator's department)
const getCoordinatorPending = async (dept_id) => {
  const students = await Student.findAll({
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

  return attachSignedDocumentUrls(students);
};

// Get all students (all statuses) for coordinator's department
const getCoordinatorAll = async (dept_id) => {
  const students = await Student.findAll({
    where: { dept_id },
    include: [
      { model: StudentVerificationRequest, required: false },
      { model: Department, attributes: ["dept_id", "dept_code", "dept_name"] },
      { model: Course, attributes: ["course_id", "course_name"] },
    ],
  });

  return students.map((student) => student.get({ plain: true }));
};

// Coordinator approves student → DB trigger generates TNP ID
const verifyByCoordinator = async (student_id, staff_id, coordinator_dept_id) => {
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

    // Enforce department scoping — coordinator can only verify students in their department
    if (student.dept_id !== coordinator_dept_id) {
      throw { status: 403, message: "You can only verify students from your department" };
    }

    // Update verification request — DB trigger will auto-generate TNP ID
    req.coordinator_status = "Approved";
    req.verified_by_coordinator = staff_id;
    req.updated_at = new Date();
    await req.save({ transaction: t });

    // Reload student to get the TNP ID set by trigger
    await student.reload({ transaction: t });

    return { message: "Student verified successfully", tnp_id: student.tnp_id };
  });
};

// Coordinator rejects student
const rejectByCoordinator = async (student_id, staff_id, coordinator_dept_id, reason) => {
  return await sequelize.transaction(async (t) => {
    const req = await StudentVerificationRequest.findOne({
      where: { student_id, coordinator_status: "Pending" },
      transaction: t,
    });

    if (!req) {
      throw { status: 404, message: "No pending verification request found for this student" };
    }

    // Enforce department scoping
    const student = await Student.findOne({ where: { student_id }, transaction: t });
    if (!student) throw { status: 404, message: "Student not found" };

    if (student.dept_id !== coordinator_dept_id) {
      throw { status: 403, message: "You can only reject students from your department" };
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
