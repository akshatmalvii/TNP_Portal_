import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveLockOverride = sequelize.define(
  "DriveLockOverride",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    rule_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "drive_lock_override",
    timestamps: false
  }
);

export default DriveLockOverride;