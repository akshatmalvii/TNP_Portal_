import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentEducation = sequelize.define(
  "StudentEducation",
  {
    education_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    education_type: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["SSC", "HSC", "Diploma"]]
      }
    },

    institution_name: {
      type: DataTypes.STRING(255)
    },

    board_or_university: {
      type: DataTypes.STRING(255)
    },

    course_name: {
      type: DataTypes.STRING(255)
    },

    program: {
      type: DataTypes.STRING(100)
    },

    stream: {
      type: DataTypes.STRING(100)
    },

    passing_year: {
      type: DataTypes.INTEGER
    },

    percentage: {
      type: DataTypes.DECIMAL(5, 2)
    },

    cgpa: {
      type: DataTypes.DECIMAL(4, 2)
    }
  },
  {
    tableName: "student_education",
    timestamps: false
  }
);

export default StudentEducation;
