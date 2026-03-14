import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StaffAdmin = sequelize.define(
  "StaffAdmin",
  {
    staff_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: "staff_admins",
    timestamps: false
  }
);

export default StaffAdmin;