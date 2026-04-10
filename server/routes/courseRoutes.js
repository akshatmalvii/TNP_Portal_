import express from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../contollers/courseController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {authorizeRoles} from "../middleware/roleMiddleware.js";
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authorizeRoles('TPO_Head'), requireStaffFullName, createCourse);
router.put('/:id', authorizeRoles('TPO_Head'), requireStaffFullName, updateCourse);
router.delete('/:id', authorizeRoles('TPO_Head'), requireStaffFullName, deleteCourse);

export default router;
