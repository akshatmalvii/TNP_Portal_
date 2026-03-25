import {DataTypes} from 'sequelize';
import sequelize from '../config/db.js';

const Course = sequelize.define(
    'Course',
    {
        course_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        course_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'courses',
        timestamps: false,
    },
);

export default Course;
