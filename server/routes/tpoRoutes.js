import express from "express";
import tpoController from "../controllers/tpoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadPdfOnly } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("TPO", "TPO_Head"));

// TPO Drive Creation
router.get("/companies", tpoController.getCompanies);
router.get("/drives", tpoController.getDrives);
router.get("/drive/:id", tpoController.getDrive);
router.get("/drive-approvals", authorizeRoles("TPO"), tpoController.getPendingDriveApprovals);
router.post("/drive-approvals/:id/approve", authorizeRoles("TPO"), tpoController.approveDrive);
router.post("/drive-approvals/:id/reject", authorizeRoles("TPO"), tpoController.rejectDriveApproval);
router.put("/drive/:id", tpoController.updateDrive);
router.post("/drive/:id/documents", uploadPdfOnly.array("documents", 10), tpoController.uploadDriveDocuments);
router.delete("/drive/:id", tpoController.deleteDrive);
router.get("/coordinators", authorizeRoles("TPO"), tpoController.getCoordinators);
router.post("/coordinators", authorizeRoles("TPO"), tpoController.createCoordinator);
router.put("/coordinators/:staff_id/status", authorizeRoles("TPO"), tpoController.updateCoordinatorStatus);
router.delete("/coordinators/:staff_id", authorizeRoles("TPO"), tpoController.deleteCoordinator);
router.get("/policy", authorizeRoles("TPO"), tpoController.getDepartmentPolicy);
router.get("/policy/history", authorizeRoles("TPO"), tpoController.getDepartmentPolicyHistory);
router.put("/policy", authorizeRoles("TPO"), tpoController.updateDepartmentPolicy);

export default router;
