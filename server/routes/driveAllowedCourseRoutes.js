import express from 'express';
import {
    getCoursesForDrive,
    addCoursesToDrive,
    removeCourseFromDrive,
    checkCourseAllowed,
} from '../contollers/driveAllowedCourseController.js';
import {authorizeRoles} from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get all allowed courses for a drive
router.get('/drive/:drive_id', getCoursesForDrive);

// Add courses to a drive
router.post(
    '/drive/:drive_id',
    authorizeRoles('TPO', 'Placement_Coordinator'),
    addCoursesToDrive,
);

// Remove a specific course from a drive
router.delete(
    '/drive/:drive_id/course/:course_id',
    authorizeRoles('TPO', 'Placement_Coordinator'),
    removeCourseFromDrive,
);

// Check if a particular course is allowed for a drive
router.get('/drive/:drive_id/course/:course_id', checkCourseAllowed);

export default router;
