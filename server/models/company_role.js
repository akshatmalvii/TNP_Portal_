import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CompanyRole = sequelize.define(
  "CompanyRole",
  {
    company_role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    role_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    role_description: {
      type: DataTypes.TEXT
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "company_roles",
    timestamps: false
  }
);

export default CompanyRole;
