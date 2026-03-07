import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define(
  "Student",
  {
    student_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    tnp_id: {
      type: DataTypes.STRING,
      allowNull: false
    },

    cgpa: {
      type: DataTypes.FLOAT
    },

    backlogs: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    current_placement_status: {
      type: DataTypes.STRING
    },

    resume_url: {
      type: DataTypes.STRING
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "students",
    timestamps: false
  }
);

export default Student;