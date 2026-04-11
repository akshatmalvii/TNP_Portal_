import express from "express";
import coordinatorController from "../controllers/coordinatorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadPdfOnly, uploadSpreadsheet } from "../middleware/uploadMiddleware.js";
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Placement_Coordinator"));

router.get("/context", coordinatorController.getCoordinatorContext);
router.get("/companies", coordinatorController.listCompanies);
router.post("/company", requireStaffFullName, coordinatorController.createCompany);
router.get("/courses", coordinatorController.getCourses);
router.get("/drives", coordinatorController.listDrives);
router.post("/drives", requireStaffFullName, coordinatorController.createDrive);
router.post("/drive", requireStaffFullName, coordinatorController.createDrive);
router.post(
  "/drives/:id/documents",
  requireStaffFullName,
  uploadPdfOnly.array("documents", 10),
  coordinatorController.uploadDriveDocuments
);
router.post(
  "/drive/:id/documents",
  requireStaffFullName,
  uploadPdfOnly.array("documents", 10),
  coordinatorController.uploadDriveDocuments
);
router.get("/drives/:drive_id/process", coordinatorController.getDriveProcess);
router.post("/drives/:drive_id/rounds", requireStaffFullName, coordinatorController.createRound);
router.post(
  "/drives/:drive_id/rounds/:round_id/results",
  requireStaffFullName,
  uploadSpreadsheet.single("resultsFile"),
  coordinatorController.uploadRoundResults
);

export default router;
