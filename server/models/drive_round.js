import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveRound = sequelize.define(
  "DriveRound",
  {
    round_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    round_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    round_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    round_type: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },

    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_final_round: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    broadcasted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_by_staff: {
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
    tableName: "drive_rounds",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["drive_id", "round_number"],
      },
    ],
  }
);

export default DriveRound;
