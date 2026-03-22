import express from "express";
import { listOpenDrives, getMyApplications, applyDrive } from "../contollers/driveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("STUDENT"));

router.get("/", listOpenDrives);
router.get("/applications", getMyApplications);
router.post("/:drive_id/apply", applyDrive);

export default router;