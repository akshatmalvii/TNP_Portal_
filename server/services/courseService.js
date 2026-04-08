import { Op } from "sequelize";
import Course from "../models/course.js";
import Department from "../models/department.js";

class CourseService {
    async getAll(query = {}) {
        try {
            const whereClause = {};
            if (query.dept_id) {
                whereClause.dept_id = query.dept_id;
            }

            const courses = await Course.findAll({
                where: whereClause,
                order: [["dept_id", "ASC"], ["course_name", "ASC"]],
            });
            return courses;
        } catch (err) {
            throw {
                status: 500,
                message: "Error fetching courses",
            };
        }
    }

    async getById(id) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw {
                    status: 404,
                    message: "Course not found",
                };
            }
            return course;
        } catch (err) {
            throw err;
        }
    }

    async create(data) {
        try {
            const course_name = data.course_name?.trim();
            const dept_id = data.dept_id;

            if (!course_name) {
                throw {
                    status: 400,
                    message: "Course name is required",
                };
            }

            if (!dept_id) {
                throw {
                    status: 400,
                    message: "Department is required",
                };
            }

            const department = await Department.findByPk(dept_id);
            if (!department) {
                throw {
                    status: 404,
                    message: "Department not found",
                };
            }

            const existing = await Course.findOne({
                where: { course_name, dept_id },
            });

            if (existing) {
                throw {
                    status: 400,
                    message: "Course with this name already exists for this department",
                };
            }

            const course = await Course.create({
                course_name,
                dept_id,
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
                    message: "Course not found",
                };
            }

            const nextCourseName = data.course_name?.trim() || course.course_name;
            const nextDeptId = data.dept_id || course.dept_id;

            if (data.dept_id) {
                const department = await Department.findByPk(data.dept_id);
                if (!department) {
                    throw {
                        status: 404,
                        message: "Department not found",
                    };
                }
            }

            if (data.course_name || data.dept_id) {
                const existing = await Course.findOne({
                    where: {
                        course_name: nextCourseName,
                        dept_id: nextDeptId,
                        course_id: { [Op.ne]: id },
                    },
                });

                if (existing) {
                    throw {
                        status: 400,
                        message: "Course with this name already exists for this department",
                    };
                }
            }

            if (data.course_name) course.course_name = nextCourseName;
            if (data.dept_id) course.dept_id = nextDeptId;

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
                    message: "Course not found",
                };
            }

            await course.destroy();
            return {message: "Course deleted successfully"};
        } catch (err) {
            throw err;
        }
    }
}

export default new CourseService();
