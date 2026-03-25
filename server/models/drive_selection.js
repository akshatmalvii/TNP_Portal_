import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveSelection = sequelize.define(
  "DriveSelection",
  {
    selection_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    selection_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Selected", "Rejected", "Waitlisted"]]
      }
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "drive_selections",
    timestamps: false
  }
);

export default DriveSelection;