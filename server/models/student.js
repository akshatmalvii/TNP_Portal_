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
      allowNull: true
    },

    tnp_id: {
      type: DataTypes.STRING,
      allowNull: true
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

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_requested_at: {
      type: DataTypes.DATE
    },
    verified_at: {
      type: DataTypes.DATE
    },

    resume_url: {
      type: DataTypes.STRING
    },

    // Personal details
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING
    },
    date_of_birth: {
      type: DataTypes.DATE
    },
    mobile_number: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    blood_group: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    nationality: {
      type: DataTypes.STRING
    },
    present_postal_address: {
      type: DataTypes.TEXT
    },
    permanent_postal_address: {
      type: DataTypes.TEXT
    },

    // SSC
    ssc_passing_year: {
      type: DataTypes.INTEGER
    },
    ssc_school_name: {
      type: DataTypes.STRING
    },
    ssc_board_name: {
      type: DataTypes.STRING
    },

    // Diploma
    diploma_passing_year: {
      type: DataTypes.INTEGER
    },
    diploma_college_name: {
      type: DataTypes.STRING
    },
    diploma_course_name: {
      type: DataTypes.STRING
    },
    diploma_percentage: {
      type: DataTypes.FLOAT
    },
    diploma_cgpa: {
      type: DataTypes.FLOAT
    },

    // HSC
    hsc_passing_year: {
      type: DataTypes.INTEGER
    },
    hsc_school_name: {
      type: DataTypes.STRING
    },
    hsc_board_name: {
      type: DataTypes.STRING
    },
    hsc_stream: {
      type: DataTypes.STRING
    },

    // UG
    ug_prn_no: {
      type: DataTypes.STRING
    },
    ug_department: {
      type: DataTypes.STRING
    },
    ug_program: {
      type: DataTypes.STRING
    },
    ug_no_of_kt: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ug_running_backlogs: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    // Documents
    aadhaar_card_url: {
      type: DataTypes.STRING
    },
    ssc_marksheet_url: {
      type: DataTypes.STRING
    },
    hsc_marksheet_url: {
      type: DataTypes.STRING
    },
    ug_marksheet_url: {
      type: DataTypes.STRING
    },
    passport_photo_url: {
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