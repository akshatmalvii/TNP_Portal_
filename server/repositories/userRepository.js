import User from "../models/users.js";

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const findById = async (id) => {
  return User.findByPk(id);
};

const create = async ({ email, password_hash }) => {
  return User.create({ email, password_hash });
};

export default {
  findByEmail,
  findById,
  create
};
