import DriveAllowedCourse from '../models/drive_allowed_course.js';
import Drive from '../models/drive.js';
import Course from '../models/course.js';

class DriveAllowedCourseService {
    async getByDrive(drive_id) {
        try {
            const allowedCourses = await DriveAllowedCourse.findAll({
                where: {drive_id},
                include: [
                    {
                        model: Course,
                        attributes: ['course_id', 'course_name'],
                    },
                ],
            });
            return allowedCourses;
        } catch (err) {
            throw {
                status: 500,
                message: 'Error fetching allowed courses',
            };
        }
    }

    async addCourses(drive_id, course_ids) {
        try {
            // Verify drive exists
            const drive = await Drive.findByPk(drive_id);
            if (!drive) {
                throw {
                    status: 404,
                    message: 'Drive not found',
                };
            }

            // Clear existing allowed courses for this drive
            await DriveAllowedCourse.destroy({where: {drive_id}});

            // Add new courses
            if (course_ids && course_ids.length > 0) {
                const records = course_ids.map((course_id) => ({
                    drive_id,
                    course_id,
                }));

                await DriveAllowedCourse.bulkCreate(records);
            }

            return {message: 'Courses added successfully'};
        } catch (err) {
            throw err;
        }
    }

    async removeCourse(drive_id, course_id) {
        try {
            const record = await DriveAllowedCourse.findOne({
                where: {drive_id, course_id},
            });

            if (!record) {
                throw {
                    status: 404,
                    message: 'Course not allowed for this drive',
                };
            }

            await record.destroy();
            return {message: 'Course removed successfully'};
        } catch (err) {
            throw err;
        }
    }

    async checkCourseAllowed(drive_id, course_id) {
        try {
            const record = await DriveAllowedCourse.findOne({
                where: {drive_id, course_id},
            });

            return !!record;
        } catch (err) {
            throw err;
        }
    }
}

export default new DriveAllowedCourseService();
