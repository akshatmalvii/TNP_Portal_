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

    company_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    created_by_staff: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    approved_by_staff: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    offer_type: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Internship", "Placement", "Internship+PPO"]]
      }
    },

    package_lpa: {
      type: DataTypes.DECIMAL(6, 2)
    },

    deadline: {
      type: DataTypes.DATE
    },

    drive_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Draft", "Active", "Completed"]]
      }
    },

    approval_status: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["Pending", "Approved", "Rejected"]]
      }
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
    tableName: "drives",
    timestamps: false
  }
);

export default Drive;