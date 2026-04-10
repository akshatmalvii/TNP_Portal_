import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentNotification = sequelize.define(
  "StudentNotification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    round_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    notification_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [[
          "ROUND_SCHEDULE",
          "ROUND_RESULT",
          "FINAL_SELECTION",
          "FINAL_REJECTION",
          "GENERAL",
        ]],
      },
    },

    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    created_by_staff: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "student_notifications",
    timestamps: false,
  }
);

export default StudentNotification;
