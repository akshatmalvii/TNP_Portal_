import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Drive = sequelize.define(
  "Drive",
  {
    drive_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    created_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    verified_by_id: {
      type: DataTypes.INTEGER
    },

    offer_type: {
      type: DataTypes.STRING
    },

    package_lpa: {
      type: DataTypes.FLOAT
    },

    deadline: {
      type: DataTypes.DATE
    },

    verification_status: {
      type: DataTypes.STRING
    },

    drive_status: {
      type: DataTypes.STRING
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "drives",
    timestamps: false
  }
);

export default Drive;