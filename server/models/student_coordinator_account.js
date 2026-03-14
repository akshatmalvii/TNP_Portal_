import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentCoordinatorAccount = sequelize.define(
  "StudentCoordinatorAccount",
  {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    academic_year: {
      type: DataTypes.STRING,
      allowNull: false
    },

    assigned_by: {
      type: DataTypes.INTEGER
    },

    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "student_coordinator_accounts",
    timestamps: false
  }
);

export default StudentCoordinatorAccount;