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
      allowNull: false
    },

    role_level_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    role_level: {
      type: DataTypes.STRING,
      allowNull: false
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "staff_admins",
    timestamps: false
  }
);

export default StaffAdmin;