import express from "express";
import { getMe, createProfile, getVerificationStatus } from "../contollers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

import { authorizeRoles as checkRole } from "../middleware/roleMiddleware.js";

router.use(verifyToken);
router.use(checkRole("STUDENT")); // Only students can access these routes directly

router.get("/me", getMe);
router.post("/", createProfile);
router.get("/verification-status", getVerificationStatus);

export default router;
