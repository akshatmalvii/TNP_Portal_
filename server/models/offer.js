import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Offer = sequelize.define(
  "Offer",
  {
    offer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    offer_category: {
      type: DataTypes.STRING(30),
      validate: {
        isIn: [["Internship", "Placement", "Internship+PPO", "PPO_Conversion"]]
      }
    },

    offered_package: {
      type: DataTypes.DECIMAL(6, 2)
    },

    acceptance_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Pending", "Accepted", "Rejected"]]
      }
    },

    offer_letter_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    offer_letter_timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "offers",
    timestamps: false
  }
);

export default Offer;