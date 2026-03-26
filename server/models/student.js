import {DataTypes} from 'sequelize';
import sequelize from '../config/db.js';

const Student = sequelize.define(
    'Student',
    {
        student_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },

        full_name: {
            type: DataTypes.STRING(255),
        },

        gender: {
            type: DataTypes.STRING(20),
        },

        marital_status: {
            type: DataTypes.STRING(20),
        },

        date_of_birth: {
            type: DataTypes.DATEONLY,
        },

        mobile_number: {
            type: DataTypes.STRING(20),
        },

        parent_mobile_number: {
            type: DataTypes.STRING(20),
        },

        email: {
            type: DataTypes.STRING(255),
        },

        blood_group: {
            type: DataTypes.STRING(10),
        },

        category: {
            type: DataTypes.STRING(50),
        },

        nationality: {
            type: DataTypes.STRING(50),
        },

        height_cm: {
            type: DataTypes.INTEGER,
        },

        weight_kg: {
            type: DataTypes.INTEGER,
        },

        present_address: {
            type: DataTypes.TEXT,
        },

        permanent_address: {
            type: DataTypes.TEXT,
        },

        dept_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        course_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'courses',
                key: 'course_id',
            },
        },

        running_backlogs: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        total_kt: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        prn: {
            type: DataTypes.STRING(50),
        },

        program: {
            type: DataTypes.STRING(100),
        },

        cgpa: {
            type: DataTypes.DECIMAL(4, 2),
        },

        tnp_id: {
            type: DataTypes.STRING(20),
            unique: true,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'students',
        timestamps: false,
    },
);

export default Student;
