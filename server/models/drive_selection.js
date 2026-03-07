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

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    selection_status: {
      type: DataTypes.STRING
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