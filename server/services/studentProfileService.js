import Student from "../models/student.js";
import StudentEducation from "../models/student_education.js";
import StudentDocument from "../models/student_document.js";
import StudentVerificationRequest from "../models/student_verification_request.js";
import Department from "../models/department.js";
import Course from "../models/course.js";
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js";

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeOptionalInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw { status: 400, message: `${fieldName} must be a valid number` };
  }

  return parsed;
};

const normalizeOptionalDecimal = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw { status: 400, message: `${fieldName} must be a valid number` };
  }

  return parsed;
};

const normalizeEducationPayload = (data = {}) => {
  const education_type = normalizeOptionalString(data.education_type);

  const normalized = {
    education_type,
    institution_name: normalizeOptionalString(data.institution_name),
    board_or_university: normalizeOptionalString(data.board_or_university),
    course_name: normalizeOptionalString(data.course_name),
    program: normalizeOptionalString(data.program),
    stream: normalizeOptionalString(data.stream),
    passing_year: normalizeOptionalInteger(data.passing_year, "Passing year"),
    percentage: normalizeOptionalDecimal(data.percentage, "Percentage"),
    cgpa: normalizeOptionalDecimal(data.cgpa, "CGPA"),
  };

  if (!normalized.education_type) {
    throw { status: 400, message: "education_type is required" };
  }

  if (!["SSC", "HSC", "Diploma"].includes(normalized.education_type)) {
    throw { status: 400, message: "Invalid education type" };
  }

  if (!normalized.institution_name) {
    throw { status: 400, message: "Institution name is required" };
  }

  if (!normalized.passing_year) {
    throw { status: 400, message: "Passing year is required" };
  }

  if (normalized.education_type === "SSC" || normalized.education_type === "HSC") {
    if (!normalized.board_or_university) {
      throw { status: 400, message: "Board name is required" };
    }
  }

  if (normalized.education_type === "HSC") {
    if (!normalized.stream) {
      throw { status: 400, message: "Stream is required for HSC" };
    }
    if (normalized.percentage === null) {
      throw { status: 400, message: "Percentage is required for HSC" };
    }
  }

  if (normalized.education_type === "Diploma" && !normalized.course_name) {
    throw { status: 400, message: "Course name is required for Diploma" };
  }

  return normalized;
};

const getProfile = async (user_id) => {
  const student = await Student.findOne({
    where: { user_id },
    include: [
      { model: Department, attributes: ["dept_id", "dept_code", "dept_name"], required: false },
      { model: Course, attributes: ["course_id", "course_name"], required: false },
      { model: StudentEducation },
      { model: StudentDocument },
      { model: StudentVerificationRequest, required: false },
    ],
  });

  if (!student) {
    throw { status: 404, message: "Student record not found" };
  }

  return student;
};

const updateProfile = async (user_id, data) => {
  const student = await Student.findOne({ where: { user_id } });
  if (!student) {
    throw { status: 404, message: "Student record not found" };
  }

  // Only allow updating specific fields
  const allowedFields = [
    "full_name", "gender", "marital_status", "date_of_birth",
    "mobile_number", "parent_mobile_number", "blood_group",
    "category", "nationality", "height_cm", "weight_kg",
    "present_address", "permanent_address",
    "dept_id", "course_id", "prn", "running_backlogs", "total_kt", "cgpa",
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  updateData.updated_at = new Date();
  await student.update(updateData);
  return student;
};

const addEducation = async (student_id, data) => {
  const normalizedData = normalizeEducationPayload(data);

  // Check if this education type already exists for this student
  const existing = await StudentEducation.findOne({
    where: { student_id, education_type: normalizedData.education_type },
  });

  if (existing) {
    // Update existing record
    await existing.update(normalizedData);
    return existing;
  }

  return StudentEducation.create({ student_id, ...normalizedData });
};

const deleteEducation = async (education_id, student_id) => {
  const record = await StudentEducation.findOne({
    where: { education_id, student_id },
  });
  if (!record) throw { status: 404, message: "Education record not found" };
  await record.destroy();
  return { message: "Education record deleted" };
};

const uploadDocument = async (student_id, file, document_type) => {
  if (!file) {
    throw { status: 400, message: "File is required" };
  }
  if (!document_type) {
    throw { status: 400, message: "document_type is required" };
  }

  // Upload to cloudinary
  const result = await uploadToCloudinary(file.buffer, `tnp_portal/students/${student_id}`);

  // Check if document of this type already exists
  const existing = await StudentDocument.findOne({
    where: { student_id, document_type },
  });

  if (existing) {
    await existing.update({ file_url: result.secure_url, uploaded_at: new Date() });
    return existing;
  }

  return StudentDocument.create({
    student_id,
    document_type,
    file_url: result.secure_url,
  });
};

const deleteDocument = async (document_id, student_id) => {
  const doc = await StudentDocument.findOne({
    where: { document_id, student_id },
  });
  if (!doc) throw { status: 404, message: "Document not found" };
  await doc.destroy();
  return { message: "Document deleted" };
};

const submitForVerification = async (student_id) => {
  // Check student has required fields filled
  const student = await Student.findByPk(student_id);
  if (!student) throw { status: 404, message: "Student not found" };

  if (!student.full_name || !student.dept_id) {
    throw { status: 400, message: "Please complete your profile (name, department) before submitting" };
  }

  // Check required documents exist
  const docs = await StudentDocument.findAll({ where: { student_id } });
  if (docs.length === 0) {
    throw { status: 400, message: "Please upload at least one document before submitting" };
  }

  // Check if already submitted
  const existing = await StudentVerificationRequest.findOne({ where: { student_id } });

  if (existing) {
    if (existing.coordinator_status === "Pending") {
      throw { status: 409, message: "Verification request already pending" };
    }
    if (existing.coordinator_status === "Approved") {
      throw { status: 409, message: "You are already verified" };
    }
    // If rejected, delete old request and allow resubmission
    if (existing.coordinator_status === "Rejected") {
      await existing.destroy();
    }
  }

  const request = await StudentVerificationRequest.create({
    student_id,
    coordinator_status: "Pending",
  });

  return request;
};

export default {
  getProfile,
  updateProfile,
  addEducation,
  deleteEducation,
  uploadDocument,
  deleteDocument,
  submitForVerification,
};
