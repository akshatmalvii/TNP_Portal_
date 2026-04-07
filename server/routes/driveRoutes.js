import express from "express";
import { listOpenDrives, getMyApplications, applyDrive, getDriveFormFields } from "../contollers/driveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Student"));

router.get("/", listOpenDrives);
router.get("/applications", getMyApplications);
router.get("/:drive_id/form", getDriveFormFields);
router.post("/apply", applyDrive);
router.post("/:drive_id/apply", applyDrive);

export default router;