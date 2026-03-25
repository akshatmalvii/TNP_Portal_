import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DepartmentPolicyRule = sequelize.define(
  "DepartmentPolicyRule",
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

    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "department_policy_rules",
    timestamps: false
  }
);

export default DepartmentPolicyRule;
