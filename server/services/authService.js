import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import studentRepository from "../repositories/studentRepository.js";
import StaffAdmin from "../models/staff_admin.js";
import rolesRepository from "../repositories/rolesRepository.js";

const JWT_SECRET = process.env.JWT_SECRET;

const register = async ({ email, password, confirmPassword, role }) => {
  if (!email || !password || !confirmPassword) {
    throw { status: 400, message: "Email, password, and confirmPassword are required" };
  }

  if (password !== confirmPassword) {
    throw { status: 400, message: "Password and confirm password do not match" };
  }

  // For now, only allow student registration via this API
  if (role && role !== "student") {
    throw { status: 400, message: "Invalid role for registration. Use admin API for staff." };
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw { status: 409, message: "User with this email already exists" };
  }

  const password_hash = await bcrypt.hash(password, 10);
  const createdUser = await userRepository.create({ email, password_hash });

  return { user: createdUser };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw { status: 400, message: "Email and password are required" };
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw { status: 401, message: "Invalid email or password" };
  }

  // Determine role. If user is in StaffAdmin, use that. Otherwise default to STUDENT.
  let role = "STUDENT";
  let dept_id = null;

  try {
     const staff = await StaffAdmin.findOne({
         where: { user_id: user.user_id }
     });

     if (staff) {
         // Assuming Role relation. Alternatively, fetch manually.
         const roleObj = await rolesRepository.findById(staff.role_id);
         if (roleObj) {
            role = roleObj.role_name;
         }
         dept_id = staff.dept_id;
     }
  } catch(e) {
     console.error("Error fetching staff role:", e);
  }

  const token = jwt.sign({ 
      user_id: user.user_id, 
      email: user.email,
      role: role,
      dept_id: dept_id
  }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    role
  };
};

export default {
  register,
  login
};