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

    dept_name: {
      type: DataTypes.STRING,
      allowNull: false
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