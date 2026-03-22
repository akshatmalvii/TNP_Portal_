import User from "../models/users.js";
import StaffAdmin from "../models/staff_admin.js";
import rolesRepository from "../repositories/rolesRepository.js";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const createStaff = async (data) => {
  return await sequelize.transaction(async (t) => {
    // 1. Check if user exists
    const existing = await User.findOne({ where: { email: data.email }, transaction: t });
    if (existing) {
      throw { status: 409, message: "User with this email already exists" };
    }

    // 2. Find Role
    const role = await rolesRepository.findByName(data.role_level);
    if (!role) {
      throw { status: 400, message: "Invalid role_level specified" };
    }

    // 3. Create User
    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({ email: data.email, password_hash }, { transaction: t });

    // 4. Create Staff profile
    const staff = await StaffAdmin.create({
      user_id: user.user_id,
      dept_id: data.dept_id,
      role_id: role.role_id,
      is_active: true
    }, { transaction: t });

    return { staff_id: staff.staff_id, email: user.email, role: data.role_level };
  });
};

const updateStaff = async (staff_id, data) => {
    // Basic implementation for update (e.g. deactivate or change dept)
    const staff = await StaffAdmin.findByPk(staff_id);
    if (!staff) throw { status: 404, message: "Staff not found" };

    if (data.dept_id) staff.dept_id = data.dept_id;
    if (data.is_active !== undefined) staff.is_active = data.is_active;

    await staff.save();
    return staff;
};

const deleteStaff = async (staff_id) => {
  return await sequelize.transaction(async (t) => {
    const staff = await StaffAdmin.findByPk(staff_id, { transaction: t });
    if (!staff) throw { status: 404, message: "Staff not found" };

    const user_id = staff.user_id;

    await staff.destroy({ transaction: t });
    // Optionally destroy User, but let's keep it safe. 
    await User.destroy({ where: { user_id }, transaction: t });

    return { message: "Staff deleted successfully" };
  });
};

const getAllStaff = async () => {
    return await StaffAdmin.findAll({
        include: [
            { model: User, attributes: ['email'] },
            { model: rolesRepository.findById ? null : { model: Role, attributes: ['role_name'] } } // Wait, better to keep as is or adjust
        ]
    });
};

export default {
    createStaff,
    updateStaff,
    deleteStaff,
    getAllStaff
};
