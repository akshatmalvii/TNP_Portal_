import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PlacementPolicyRule = sequelize.define(
  "PlacementPolicyRule",
  {
    policy_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    rule_name: {
      type: DataTypes.STRING(255),
      unique: true
    },

    allow_apply_after_internship: {
      type: DataTypes.BOOLEAN
    },

    allow_apply_after_placement: {
      type: DataTypes.BOOLEAN
    },

    min_package_difference: {
      type: DataTypes.DECIMAL(6, 2)
    },

    ignore_package_condition: {
      type: DataTypes.BOOLEAN
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "placement_policy_rules",
    timestamps: false
  }
);

export default PlacementPolicyRule;
