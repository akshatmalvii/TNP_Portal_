import express from "express";
import { getMe, getVerificationStatus } from "../contollers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Student"));

router.get("/me", getMe);
router.get("/verification-status", getVerificationStatus);

export default router;
