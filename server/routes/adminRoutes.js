import express from "express";
import { createStaff, updateStaff, deleteStaff, getAllStaff, assignDepartment } from "../contollers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes require TPO_Head role
router.use(verifyToken);
router.use(authorizeRoles("TPO_Head"));

router.get("/staff", getAllStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);
router.put("/staff/:id/assign-department", assignDepartment);

export default router;
