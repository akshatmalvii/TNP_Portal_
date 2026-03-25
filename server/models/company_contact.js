import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CompanyContact = sequelize.define(
  "CompanyContact",
  {
    contact_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    contact_name: {
      type: DataTypes.STRING(255)
    },

    contact_email: {
      type: DataTypes.STRING(255)
    },

    contact_phone: {
      type: DataTypes.STRING(20)
    },

    designation: {
      type: DataTypes.STRING(100)
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "company_contacts",
    timestamps: false
  }
);

export default CompanyContact;
