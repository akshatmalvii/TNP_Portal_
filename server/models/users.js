import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    account_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Active", "Inactive"]]
      }
    },

    password_reset_token_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    password_reset_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    refresh_token_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    refresh_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "users",
    timestamps: false
  }
);

export default User;
