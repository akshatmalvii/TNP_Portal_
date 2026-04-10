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
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Read access for any authenticated user (Students need this for dropdowns)
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);

// Write access restricted to TPO_Head
router.use(authorizeRoles("TPO_Head"));
router.post("/", requireStaffFullName, createDepartment);
router.put("/:id", requireStaffFullName, updateDepartment);
router.delete("/:id", requireStaffFullName, deleteDepartment);

export default router;
