import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveRoundResult = sequelize.define(
  "DriveRoundResult",
  {
    result_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    round_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    result_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["Qualified", "Rejected", "Absent", "Waitlisted"]],
      },
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    updated_by_staff: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "drive_round_results",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["round_id", "application_id"],
      },
    ],
  }
);

export default DriveRoundResult;
