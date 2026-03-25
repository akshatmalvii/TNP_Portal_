import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DynamicFormField = sequelize.define(
  "DynamicFormField",
  {
    field_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    field_label: {
      type: DataTypes.STRING(255)
    },

    field_key: {
      type: DataTypes.STRING(100)
    },

    field_type: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["TEXT", "NUMBER", "FILE"]]
      }
    },

    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    field_order: {
      type: DataTypes.INTEGER
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "dynamic_form_fields",
    timestamps: false
  }
);

export default DynamicFormField;
