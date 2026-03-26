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
        },
        dept_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'dept_id',
            },
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'courses',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['course_name', 'dept_id']
            }
        ]
    },
);

export default Course;
