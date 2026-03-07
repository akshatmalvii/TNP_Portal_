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
      type: DataTypes.STRING,
      allowNull: false
    },

    company_website: {
      type: DataTypes.STRING
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