import User from "../models/users.js";
import Role from "../models/role.js";
import { Op } from "sequelize";

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

const findByResetTokenHash = async (tokenHash) => {
  return User.findOne({
    where: {
      password_reset_token_hash: tokenHash,
      password_reset_expires_at: {
        [Op.gt]: new Date(),
      },
    },
    include: [{ model: Role, attributes: ["role_id", "role_name"] }],
  });
};

export default {
  findByEmail,
  findById,
  create,
  findByResetTokenHash,
};
