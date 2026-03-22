import express from "express";
import { getCoordinatorPending, verifyByCoordinator, rejectByCoordinator, getTpoPending, approveByTpo, rejectByTpo } from "../contollers/verificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Coordinator Routes
router.get("/coordinator/pending", authorizeRoles("COORDINATOR"), getCoordinatorPending);
router.post("/coordinator/:student_id", authorizeRoles("COORDINATOR"), verifyByCoordinator);
router.delete("/coordinator/:student_id", authorizeRoles("COORDINATOR"), rejectByCoordinator);

// TPO Routes
router.get("/tpo/pending", authorizeRoles("TPO"), getTpoPending);
router.post("/tpo/:student_id", authorizeRoles("TPO"), approveByTpo);
router.delete("/tpo/:student_id", authorizeRoles("TPO"), rejectByTpo);

export default router;
