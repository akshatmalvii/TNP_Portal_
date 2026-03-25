import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentDocument = sequelize.define(
  "StudentDocument",
  {
    document_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    document_type: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [[
          "Aadhaar",
          "SSC_Marksheet",
          "HSC_Marksheet",
          "UG_Marksheet",
          "Photo",
          "Resume"
        ]]
      }
    },

    file_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "student_documents",
    timestamps: false
  }
);

export default StudentDocument;
