import express from "express";
import { createStaff, updateStaff, deleteStaff, getAllStaff } from "../contollers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// router.use(verifyToken);
// router.use(authorizeRoles("MASTER_ADMIN")); // Only MASTER_ADMIN can manage staff

router.get("/staff", getAllStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

export default router;
