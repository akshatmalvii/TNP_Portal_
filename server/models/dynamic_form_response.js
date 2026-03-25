import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DynamicFormResponse = sequelize.define(
  "DynamicFormResponse",
  {
    response_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    field_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    text_value: {
      type: DataTypes.TEXT
    },

    number_value: {
      type: DataTypes.DECIMAL
    },

    file_url: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: "dynamic_form_responses",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["application_id", "field_id"]
      }
    ]
  }
);

export default DynamicFormResponse;
