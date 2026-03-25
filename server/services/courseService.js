import Course from '../models/course.js';

class CourseService {
    async getAll() {
        try {
            const courses = await Course.findAll({
                order: [['course_name', 'ASC']],
            });
            return courses;
        } catch (err) {
            throw {
                status: 500,
                message: 'Error fetching courses',
            };
        }
    }

    async getById(id) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw {
                    status: 404,
                    message: 'Course not found',
                };
            }
            return course;
        } catch (err) {
            throw err;
        }
    }

    async create(data) {
        try {
            if (!data.course_name) {
                throw {
                    status: 400,
                    message: 'Course name is required',
                };
            }

            // Check for duplicates
            const existing = await Course.findOne({
                where: {course_name: data.course_name},
            });

            if (existing) {
                throw {
                    status: 400,
                    message: 'Course with this name already exists',
                };
            }

            const course = await Course.create({
                course_name: data.course_name,
            });

            return course;
        } catch (err) {
            throw err;
        }
    }

    async update(id, data) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw {
                    status: 404,
                    message: 'Course not found',
                };
            }

            if (data.course_name) {
                const existing = await Course.findOne({
                    where: {
                        course_name: data.course_name,
                        course_id: {[require('sequelize').Op.ne]: id},
                    },
                });

                if (existing) {
                    throw {
                        status: 400,
                        message: 'Course with this name already exists',
                    };
                }

                course.course_name = data.course_name;
            }

            await course.save();
            return course;
        } catch (err) {
            throw err;
        }
    }

    async remove(id) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw {
                    status: 404,
                    message: 'Course not found',
                };
            }

            await course.destroy();
            return {message: 'Course deleted successfully'};
        } catch (err) {
            throw err;
        }
    }
}

export default new CourseService();
