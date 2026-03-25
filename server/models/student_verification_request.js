import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentVerificationRequest = sequelize.define(
  "StudentVerificationRequest",
  {
    verification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    coordinator_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Pending", "Approved", "Rejected"]]
      }
    },

    tpo_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Pending", "Approved", "Rejected"]]
      }
    },

    verified_by_coordinator: {
      type: DataTypes.INTEGER
    },

    approved_by_tpo: {
      type: DataTypes.INTEGER
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
    tableName: "student_verification_requests",
    timestamps: false
  }
);

export default StudentVerificationRequest;