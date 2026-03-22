import rolesRepository from "../repositories/rolesRepository.js";

const getAllRoles = async () => {
  return await rolesRepository.findAll();
};

const getRoleById = async (id) => {
  return await rolesRepository.findById(id);
};

const createRole = async (data) => {
  const existing = await rolesRepository.findByName(data.role_name);
  if (existing) {
    throw { status: 409, message: "Role with this name already exists" };
  }
  return await rolesRepository.create(data);
};

const updateRole = async (id, data) => {
  const role = await rolesRepository.update(id, data);
  if (!role) {
    throw { status: 404, message: "Role not found" };
  }
  return role;
};

const deleteRole = async (id) => {
  const role = await rolesRepository.deleteById(id);
  if (!role) {
    throw { status: 404, message: "Role not found" };
  }
  return { message: "Role deleted successfully" };
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};