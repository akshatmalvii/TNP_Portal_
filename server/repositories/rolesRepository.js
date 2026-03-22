import Role from "../models/role.js";

const findAll = async () => {
  return Role.findAll();
};

const findById = async (id) => {
  return Role.findByPk(id);
};

const findByName = async (role_name) => {
  return Role.findOne({ where: { role_name } });
};

const create = async (data) => {
  return Role.create(data);
};

const update = async (id, data) => {
  const role = await Role.findByPk(id);
  if (!role) return null;
  return role.update(data);
};

const deleteById = async (id) => {
  const role = await Role.findByPk(id);
  if (!role) return null;
  await role.destroy();
  return role;
};

export default {
  findAll,
  findById,
  findByName,
  create,
  update,
  deleteById
};