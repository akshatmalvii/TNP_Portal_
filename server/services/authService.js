import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userRepository from "../repositories/userRepository.js";
import studentRepository from "../repositories/studentRepository.js";
import Role from "../models/role.js";
import User from "../models/users.js";
import Student from "../models/student.js";
import { sendPasswordResetEmail, isMailerConfigured } from "../utils/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);

const buildCurrentUserPayload = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Role, attributes: ["role_id", "role_name"] },
      { model: Student, attributes: ["student_id", "full_name"], required: false },
    ],
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const role = user.Role ? user.Role.role_name : "Student";
  const studentFullName = user.Student?.full_name || "";
  const staffFullName = user.full_name || "";
  const displayName = role === "Student"
    ? studentFullName || user.email
    : staffFullName || user.email;
  const nameCompleted = role === "Student"
    ? Boolean(String(studentFullName).trim())
    : Boolean(String(staffFullName).trim());

  return {
    user_id: user.user_id,
    email: user.email,
    role,
    full_name: role === "Student" ? studentFullName : staffFullName,
    display_name: displayName,
    name_completed: nameCompleted,
  };
};

const register = async ({ email, password, confirmPassword }) => {
  if (!email || !password || !confirmPassword) {
    throw { status: 400, message: "Email, password, and confirmPassword are required" };
  }

  if (password !== confirmPassword) {
    throw { status: 400, message: "Password and confirm password do not match" };
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw { status: 409, message: "User with this email already exists" };
  }

  // Get the Student role
  const studentRole = await Role.findOne({ where: { role_name: "Student" } });
  if (!studentRole) {
    throw { status: 500, message: "Student role not found. Please run seed first." };
  }

  const password_hash = await bcrypt.hash(password, 10);

  const createdUser = await userRepository.create({
    email,
    password_hash,
    role_id: studentRole.role_id,
    account_status: "Active"
  });

  // Create a student record linked to this user
  await studentRepository.create({
    user_id: createdUser.user_id,
    email: email
  });

  return { user: { user_id: createdUser.user_id, email: createdUser.email } };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw { status: 400, message: "Email and password are required" };
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  if (user.account_status === "Inactive") {
    throw { status: 403, message: "Your account has been deactivated. Contact admin." };
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // Role comes from users.role_id → roles.role_name (via include)
  const role = user.Role ? user.Role.role_name : "Student";

  const token = jwt.sign({
    user_id: user.user_id,
    email: user.email,
    role: role
  }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    role,
    user: await buildCurrentUserPayload(user.user_id),
  };
};

const forgotPassword = async ({ email }) => {
  if (!email) {
    throw { status: 400, message: "Email is required" };
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    return {
      message: "If an account exists for that email, a reset link has been sent.",
    };
  }

  if (!isMailerConfigured()) {
    throw { status: 500, message: "Reset email service is not configured" };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

  user.password_reset_token_hash = tokenHash;
  user.password_reset_expires_at = expiresAt;
  await user.save();

  const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    resetLink,
  });

  return {
    message: "If an account exists for that email, a reset link has been sent.",
  };
};

const validateResetToken = async (token) => {
  if (!token) {
    throw { status: 400, message: "Reset token is required" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await userRepository.findByResetTokenHash(tokenHash);

  if (!user) {
    throw { status: 400, message: "This reset link is invalid or has expired" };
  }

  return { valid: true };
};

const resetPassword = async ({ token, password, confirmPassword }) => {
  if (!token || !password || !confirmPassword) {
    throw { status: 400, message: "Token, password, and confirmPassword are required" };
  }

  if (password !== confirmPassword) {
    throw { status: 400, message: "Password and confirm password do not match" };
  }

  if (password.length < 6) {
    throw { status: 400, message: "Password must be at least 6 characters" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await userRepository.findByResetTokenHash(tokenHash);

  if (!user) {
    throw { status: 400, message: "This reset link is invalid or has expired" };
  }

  user.password_hash = await bcrypt.hash(password, 10);
  user.password_reset_token_hash = null;
  user.password_reset_expires_at = null;
  user.updated_at = new Date();
  await user.save();

  return { message: "Password reset successfully" };
};

const getCurrentUser = async (userId) => {
  return buildCurrentUserPayload(userId);
};

const updateCurrentUser = async (userId, { full_name }) => {
  const normalizedFullName = String(full_name || "").trim();

  if (!normalizedFullName) {
    throw { status: 400, message: "full_name is required" };
  }

  const user = await User.findByPk(userId, {
    include: [{ model: Role, attributes: ["role_id", "role_name"] }],
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  if (user.Role?.role_name === "Student") {
    throw { status: 403, message: "Students should update their name from the student profile page" };
  }

  user.full_name = normalizedFullName;
  user.updated_at = new Date();
  await user.save();

  return buildCurrentUserPayload(user.user_id);
};

export default {
  register,
  login,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
};
