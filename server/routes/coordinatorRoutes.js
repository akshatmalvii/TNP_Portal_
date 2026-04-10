import express from "express";
import coordinatorController from "../controllers/coordinatorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadPdfOnly, uploadSpreadsheet } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Placement_Coordinator"));

router.get("/context", coordinatorController.getCoordinatorContext);
router.get("/companies", coordinatorController.listCompanies);
router.post("/company", coordinatorController.createCompany);
router.get("/drives", coordinatorController.listDrives);
router.post("/drives", coordinatorController.createDrive);
router.post("/drive", coordinatorController.createDrive);
router.post(
  "/drives/:id/documents",
  uploadPdfOnly.array("documents", 10),
  coordinatorController.uploadDriveDocuments
);
router.post(
  "/drive/:id/documents",
  uploadPdfOnly.array("documents", 10),
  coordinatorController.uploadDriveDocuments
);
router.get("/drives/:drive_id/process", coordinatorController.getDriveProcess);
router.post("/drives/:drive_id/rounds", coordinatorController.createRound);
router.post(
  "/drives/:drive_id/rounds/:round_id/results",
  uploadSpreadsheet.single("resultsFile"),
  coordinatorController.uploadRoundResults
);

export default router;
