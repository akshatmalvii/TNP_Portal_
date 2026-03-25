import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DepartmentTpoAssignment = sequelize.define(
  "DepartmentTpoAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    tpo_staff_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "department_tpo_assignment",
    timestamps: false
  }
);

export default DepartmentTpoAssignment;
