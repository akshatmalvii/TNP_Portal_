import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentApplication = sequelize.define(
  "StudentApplication",
  {
    application_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    application_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Applied", "Withdrawn", "InProgress"]]
      }
    },

    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "student_applications",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["student_id", "drive_id"]
      }
    ]
  }
);

export default StudentApplication;