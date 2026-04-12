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
      allowNull: true,
      references: {
        model: 'companies',
        key: 'company_id',
      }
    },

    role_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    role_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    placement_season: {
      type: DataTypes.STRING(9),
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

    stipend_pm: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    has_bond: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    bond_months: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    has_security_deposit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    security_deposit_amount: {
      type: DataTypes.STRING(255),
      allowNull: true
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
