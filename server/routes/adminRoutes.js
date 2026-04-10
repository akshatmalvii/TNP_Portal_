import express from "express";
import { createStaff, updateStaff, deleteStaff, getAllStaff, assignDepartment } from "../contollers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

// All admin routes require TPO_Head role
router.use(verifyToken);
router.use(authorizeRoles("TPO_Head"));

router.get("/staff", getAllStaff);
router.post("/staff", requireStaffFullName, createStaff);
router.put("/staff/:id", requireStaffFullName, updateStaff);
router.delete("/staff/:id", requireStaffFullName, deleteStaff);
router.put("/staff/:id/assign-department", requireStaffFullName, assignDepartment);

export default router;
