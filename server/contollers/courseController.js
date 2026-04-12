import courseService from '../services/courseService.js';
import StaffAdmin from "../models/staff_admin.js";

const getScopedCourseQuery = async (req) => {
    const scopedQuery = {...req.query};

    if (!["TPO", "Placement_Coordinator"].includes(req.user?.role)) {
        return scopedQuery;
    }

    const staffUser = await StaffAdmin.findOne({
        where: {user_id: req.user.user_id},
        attributes: ["dept_id"],
    });

    if (!staffUser?.dept_id) {
        throw {
            status: 403,
            message: "Staff department mapping not found",
        };
    }

    scopedQuery.dept_id = staffUser.dept_id;
    return scopedQuery;
};

export const getAllCourses = async (req, res) => {
    try {
        const scopedQuery = await getScopedCourseQuery(req);
        const courses = await courseService.getAll(scopedQuery);
        return res.json(courses);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to fetch courses'});
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await courseService.getById(req.params.id);

        if (["TPO", "Placement_Coordinator"].includes(req.user?.role)) {
            const staffUser = await StaffAdmin.findOne({
                where: {user_id: req.user.user_id},
                attributes: ["dept_id"],
            });

            if (!staffUser?.dept_id || Number(course.dept_id) !== Number(staffUser.dept_id)) {
                return res.status(404).json({error: "Course not found"});
            }
        }

        return res.json(course);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to fetch course'});
    }
};

export const createCourse = async (req, res) => {
    try {
        const course = await courseService.create(req.body);
        return res
            .status(201)
            .json({message: 'Course created successfully', course});
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to create course'});
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await courseService.update(req.params.id, req.body);
        return res.json({message: 'Course updated successfully', course});
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to update course'});
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const result = await courseService.remove(req.params.id);
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to delete course'});
    }
};
