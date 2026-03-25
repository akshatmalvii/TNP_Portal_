import courseService from '../services/courseService.js';

export const getAllCourses = async (req, res) => {
    try {
        const courses = await courseService.getAll();
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
