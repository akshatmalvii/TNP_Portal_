import User from "../models/users.js";
import StaffAdmin from "../models/staff_admin.js";
import Role from "../models/role.js";
import Department from "../models/department.js";
import DepartmentTpoAssignment from "../models/department_tpo_assignment.js";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

const createStaffAccount = async ({ email, password, role_name, dept_id }) => {
  if (!email || !password || !role_name) {
    throw { status: 400, message: "email, password, and role_name are required" };
  }

  await validatePasswordStrength({ password, email });

  return await sequelize.transaction(async (t) => {
    // Check if user exists
    const existing = await User.findOne({ where: { email }, transaction: t });
    if (existing) {
      throw { status: 409, message: "User with this email already exists" };
    }

    // Find role
    const role = await Role.findOne({ where: { role_name }, transaction: t });
    if (!role) {
      throw { status: 400, message: "Role not found in system" };
    }

    // Create user with role_id
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash,
      role_id: role.role_id,
      account_status: "Active"
    }, { transaction: t });

    // Create staff admin record
    const staff = await StaffAdmin.create({
      user_id: user.user_id,
      dept_id: dept_id || null
    }, { transaction: t });

    return {
      staff_id: staff.staff_id,
      user_id: user.user_id,
      email: user.email,
      role_name,
      dept_id: staff.dept_id
    };
  });
};

const createStaff = async ({ email, password, role_name, dept_id }) => {
  const allowedRoles = ["TPO"];
  if (!allowedRoles.includes(role_name)) {
    throw { status: 400, message: `role_name must be one of: ${allowedRoles.join(", ")}` };
  }
  if (!dept_id) {
    throw { status: 400, message: "Department is required for TPO" };
  }

  return createStaffAccount({ email, password, role_name, dept_id });
};

const updateStaff = async (staff_id, data) => {
  const staff = await StaffAdmin.findByPk(staff_id, {
    include: [{ model: User, include: [{ model: Role }] }]
  });
  if (!staff) throw { status: 404, message: "Staff not found" };

  if (data.dept_id !== undefined) staff.dept_id = data.dept_id;
  await staff.save();

  // Update account_status on user if provided
  if (data.account_status && staff.User) {
    if (!["Active", "Inactive"].includes(data.account_status)) {
      throw { status: 400, message: "account_status must be Active or Inactive" };
    }
    staff.User.account_status = data.account_status;
    await staff.User.save();
  }

  return staff;
};

const deleteStaff = async (staff_id) => {
  return await sequelize.transaction(async (t) => {
    const staff = await StaffAdmin.findByPk(staff_id, { transaction: t });
    if (!staff) throw { status: 404, message: "Staff not found" };

    const user_id = staff.user_id;

    // Remove any department TPO assignments
    await DepartmentTpoAssignment.destroy({
      where: { tpo_staff_id: staff_id },
      transaction: t
    });

    await staff.destroy({ transaction: t });
    await User.destroy({ where: { user_id }, transaction: t });

    return { message: "Staff account deleted successfully" };
  });
};

const getAllStaff = async (role_filter, dept_filter = null) => {
  const whereClause = {};

  const include = [
    {
      model: User,
      attributes: ["user_id", "email", "account_status"],
      include: [{ model: Role, attributes: ["role_id", "role_name"] }]
    },
    {
      model: Department,
      attributes: ["dept_id", "dept_code", "dept_name"],
      required: false
    }
  ];

  const staffList = await StaffAdmin.findAll({ include });

  // Filter by role if specified
  return staffList.filter((staff) => {
    const matchesRole = !role_filter || (
      staff.User && staff.User.Role && staff.User.Role.role_name === role_filter
    );
    const matchesDept = !dept_filter || staff.dept_id === dept_filter;
    return matchesRole && matchesDept;
  });
};

const assignDepartment = async (staff_id, dept_id) => {
  const staff = await StaffAdmin.findByPk(staff_id, {
    include: [{ model: User, include: [{ model: Role }] }]
  });
  if (!staff) throw { status: 404, message: "Staff not found" };

  // Only TPOs can be assigned to departments via department_tpo_assignment
  if (staff.User && staff.User.Role && staff.User.Role.role_name === "TPO") {
    // Update staff's dept_id
    staff.dept_id = dept_id;
    await staff.save();

    // Create/update department_tpo_assignment
    await DepartmentTpoAssignment.upsert({
      dept_id,
      tpo_staff_id: staff_id
    });
  } else {
    // For coordinators, just update dept_id
    staff.dept_id = dept_id;
    await staff.save();
  }

  return { message: "Department assigned successfully", staff_id, dept_id };
};

const getCoordinatorsByDepartment = async (dept_id) => {
  if (!dept_id) {
    throw { status: 400, message: "TPO department is required" };
  }

  return getAllStaff("Placement_Coordinator", dept_id);
};

const createCoordinatorForDepartment = async ({ email, password, dept_id }) => {
  if (!dept_id) {
    throw { status: 400, message: "TPO department is required" };
  }

  return createStaffAccount({
    email,
    password,
    role_name: "Placement_Coordinator",
    dept_id,
  });
};

const deleteCoordinatorForDepartment = async (staff_id, dept_id) => {
  if (!dept_id) {
    throw { status: 400, message: "TPO department is required" };
  }

  const staff = await StaffAdmin.findByPk(staff_id, {
    include: [{ model: User, include: [{ model: Role }] }]
  });

  if (!staff) {
    throw { status: 404, message: "Coordinator not found" };
  }

  if (staff.dept_id !== dept_id) {
    throw { status: 403, message: "You can only manage coordinators in your department" };
  }

  if (staff.User?.Role?.role_name !== "Placement_Coordinator") {
    throw { status: 400, message: "Selected staff member is not a coordinator" };
  }

  return deleteStaff(staff_id);
};

const updateCoordinatorStatusForDepartment = async (staff_id, dept_id, account_status) => {
  if (!dept_id) {
    throw { status: 400, message: "TPO department is required" };
  }

  if (!["Active", "Inactive"].includes(account_status)) {
    throw { status: 400, message: "account_status must be Active or Inactive" };
  }

  const staff = await StaffAdmin.findByPk(staff_id, {
    include: [{ model: User, include: [{ model: Role }] }]
  });

  if (!staff) {
    throw { status: 404, message: "Coordinator not found" };
  }

  if (staff.dept_id !== dept_id) {
    throw { status: 403, message: "You can only manage coordinators in your department" };
  }

  if (staff.User?.Role?.role_name !== "Placement_Coordinator") {
    throw { status: 400, message: "Selected staff member is not a coordinator" };
  }

  staff.User.account_status = account_status;
  await staff.User.save();

  return staff;
};

export default {
  createStaff,
  updateStaff,
  deleteStaff,
  getAllStaff,
  assignDepartment,
  getCoordinatorsByDepartment,
  createCoordinatorForDepartment,
  deleteCoordinatorForDepartment,
  updateCoordinatorStatusForDepartment
};
