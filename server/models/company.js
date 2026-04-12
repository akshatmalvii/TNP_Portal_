import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Company = sequelize.define(
  "Company",
  {
    company_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    company_website: {
      type: DataTypes.TEXT
    },

    placement_season: {
      type: DataTypes.STRING(9),
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "companies",
    timestamps: false
  }
);

export default Company;