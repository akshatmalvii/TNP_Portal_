import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import studentRepository from "../repositories/studentRepository.js";
import Role from "../models/role.js";

const JWT_SECRET = process.env.JWT_SECRET;

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
    user: {
      user_id: user.user_id,
      email: user.email
    }
  };
};

export default {
  register,
  login
};