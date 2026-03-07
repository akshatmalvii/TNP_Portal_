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

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    offered_package: {
      type: DataTypes.FLOAT
    },

    accepted_status: {
      type: DataTypes.STRING
    },

    created_at: {
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