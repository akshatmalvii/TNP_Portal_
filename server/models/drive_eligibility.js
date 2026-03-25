import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveEligibility = sequelize.define(
  "DriveEligibility",
  {
    eligibility_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    min_cgpa: {
      type: DataTypes.DECIMAL(4, 2)
    },

    max_backlogs: {
      type: DataTypes.INTEGER
    },

    min_10th_percent: {
      type: DataTypes.DECIMAL(5, 2)
    },

    min_12th_percent: {
      type: DataTypes.DECIMAL(5, 2)
    },

    gender: {
      type: DataTypes.STRING(10)
    },

    passing_year: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: "drive_eligibility",
    timestamps: false
  }
);

export default DriveEligibility;
