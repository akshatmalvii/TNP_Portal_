import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LockRule = sequelize.define(
  "LockRule",
  {
    rule_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    rule_name: {
      type: DataTypes.STRING
    },

    allow_after_placement: {
      type: DataTypes.BOOLEAN
    },

    allow_after_internship: {
      type: DataTypes.BOOLEAN
    },

    min_package_difference: {
      type: DataTypes.FLOAT
    },

    ignore_package_condition: {
      type: DataTypes.BOOLEAN
    }
  },
  {
    tableName: "lock_rules",
    timestamps: false
  }
);

export default LockRule;