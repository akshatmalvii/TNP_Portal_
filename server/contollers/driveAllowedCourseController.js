import driveAllowedCourseService from '../services/driveAllowedCourseService.js';

export const getCoursesForDrive = async (req, res) => {
    try {
        const courses = await driveAllowedCourseService.getByDrive(
            req.params.drive_id,
        );
        return res.json(courses);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to fetch courses'});
    }
};

export const addCoursesToDrive = async (req, res) => {
    try {
        const {course_ids} = req.body;
        const result = await driveAllowedCourseService.addCourses(
            req.params.drive_id,
            course_ids,
        );
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to add courses'});
    }
};

export const removeCourseFromDrive = async (req, res) => {
    try {
        const result = await driveAllowedCourseService.removeCourse(
            req.params.drive_id,
            req.params.course_id,
        );
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to remove course'});
    }
};

export const checkCourseAllowed = async (req, res) => {
    try {
        const allowed = await driveAllowedCourseService.checkCourseAllowed(
            req.params.drive_id,
            req.params.course_id,
        );
        return res.json({allowed});
    } catch (err) {
        console.error(err);
        return res
            .status(err.status || 500)
            .json({error: err.message || 'Failed to check course'});
    }
};
