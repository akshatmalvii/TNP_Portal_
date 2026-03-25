import {DataTypes} from 'sequelize';
import sequelize from '../config/db.js';

const DriveAllowedCourse = sequelize.define(
    'DriveAllowedCourse',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        drive_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'drives',
                key: 'drive_id',
            },
            onDelete: 'CASCADE',
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'courses',
                key: 'course_id',
            },
            onDelete: 'CASCADE',
        },
    },
    {
        tableName: 'drive_allowed_courses',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['drive_id', 'course_id'],
            },
        ],
    },
);

export default DriveAllowedCourse;
