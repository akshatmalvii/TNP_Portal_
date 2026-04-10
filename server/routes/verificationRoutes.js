import express from "express";
import { getCoordinatorPending, getCoordinatorAll, verifyByCoordinator, rejectByCoordinator } from "../contollers/verificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Coordinator Routes
router.get("/coordinator/pending", authorizeRoles("Placement_Coordinator"), getCoordinatorPending);
router.get("/coordinator/all", authorizeRoles("Placement_Coordinator"), getCoordinatorAll);
router.post("/coordinator/:student_id", authorizeRoles("Placement_Coordinator"), requireStaffFullName, verifyByCoordinator);
router.delete("/coordinator/:student_id", authorizeRoles("Placement_Coordinator"), requireStaffFullName, rejectByCoordinator);

export default router;
