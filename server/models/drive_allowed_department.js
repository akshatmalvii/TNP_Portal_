import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveAllowedDepartment = sequelize.define(
  "DriveAllowedDepartment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "drive_allowed_departments",
    timestamps: false
  }
);

export default DriveAllowedDepartment;