import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DepartmentDefaultLock = sequelize.define(
  "DepartmentDefaultLock",
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

    rule_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "department_default_lock",
    timestamps: false
  }
);

export default DepartmentDefaultLock;