import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Department = sequelize.define(
  "Department",
  {
    dept_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    dept_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },

    dept_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "departments",
    timestamps: false
  }
);

export default Department;