import express from "express";
import notificationController from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Student"));

router.get("/me", notificationController.getMyNotifications);
router.post("/me/read-all", notificationController.markAllRead);

export default router;
