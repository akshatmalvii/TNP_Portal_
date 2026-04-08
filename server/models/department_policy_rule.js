import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DepartmentPolicyRule = sequelize.define(
  "DepartmentPolicyRule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    effective_from: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    effective_to: {
      type: DataTypes.DATE,
      allowNull: true
    },

    changed_by_staff: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    change_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "department_policy_rules",
    timestamps: false,
    indexes: [
      {
        fields: ["dept_id", "effective_from"]
      },
      {
        fields: ["changed_by_staff"]
      }
    ]
  }
);

export default DepartmentPolicyRule;
