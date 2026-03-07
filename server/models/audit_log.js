import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    staff_id: {
      type: DataTypes.INTEGER
    },

    action_type: {
      type: DataTypes.STRING
    },

    action_description: {
      type: DataTypes.TEXT
    },

    logged_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "audit_logs",
    timestamps: false
  }
);

export default AuditLog;