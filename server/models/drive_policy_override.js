import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DrivePolicyOverride = sequelize.define(
  "DrivePolicyOverride",
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

    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "drive_policy_override",
    timestamps: false
  }
);

export default DrivePolicyOverride;
