import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../contollers/departmentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Read access for any authenticated user (Students need this for dropdowns)
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);

// Write access restricted to TPO_Head
router.use(authorizeRoles("TPO_Head"));
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
