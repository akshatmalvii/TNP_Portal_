import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import StaffAdmin from "./staff_admin.js";

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

    dept_id: {
      type: DataTypes.INTEGER
    },

    placement_season: {
      type: DataTypes.STRING
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

AuditLog.belongsTo(StaffAdmin, { foreignKey: "staff_id", as: "StaffAdmin" });
StaffAdmin.hasMany(AuditLog, { foreignKey: "staff_id" });

export default AuditLog;