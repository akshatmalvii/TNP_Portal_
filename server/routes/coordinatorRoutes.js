import express from "express";
import coordinatorController from "../controllers/coordinatorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadSpreadsheet } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Placement_Coordinator"));

router.get("/drives", coordinatorController.listDrives);
router.get("/drives/:drive_id/process", coordinatorController.getDriveProcess);
router.post("/drives/:drive_id/rounds", coordinatorController.createRound);
router.post(
  "/drives/:drive_id/rounds/:round_id/results",
  uploadSpreadsheet.single("resultsFile"),
  coordinatorController.uploadRoundResults
);

export default router;
