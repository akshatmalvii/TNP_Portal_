import User from "../models/users.js";
import Role from "../models/role.js";

const findByEmail = async (email) => {
  return User.findOne({
    where: { email },
    include: [{ model: Role, attributes: ["role_id", "role_name"] }]
  });
};

const findById = async (id) => {
  return User.findByPk(id, {
    include: [{ model: Role, attributes: ["role_id", "role_name"] }]
  });
};

const create = async ({ email, password_hash, role_id, account_status }) => {
  return User.create({ email, password_hash, role_id, account_status });
};

export default {
  findByEmail,
  findById,
  create
};
