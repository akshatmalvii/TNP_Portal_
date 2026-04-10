import express from "express";
import tpoController from "../controllers/tpoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadPdfOnly } from "../middleware/uploadMiddleware.js";
import { requireStaffFullName } from "../middleware/staffProfileMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("TPO", "TPO_Head"));

// TPO Drive Creation
router.get("/companies", tpoController.getCompanies);
router.get("/drives", tpoController.getDrives);
router.get("/drive/:id", tpoController.getDrive);
router.get("/drive-approvals", authorizeRoles("TPO"), tpoController.getPendingDriveApprovals);
router.post("/drive-approvals/:id/approve", authorizeRoles("TPO"), requireStaffFullName, tpoController.approveDrive);
router.post("/drive-approvals/:id/reject", authorizeRoles("TPO"), requireStaffFullName, tpoController.rejectDriveApproval);
router.put("/drive/:id", requireStaffFullName, tpoController.updateDrive);
router.post("/drive/:id/documents", requireStaffFullName, uploadPdfOnly.array("documents", 10), tpoController.uploadDriveDocuments);
router.delete("/drive/:id", requireStaffFullName, tpoController.deleteDrive);
router.get("/coordinators", authorizeRoles("TPO"), tpoController.getCoordinators);
router.post("/coordinators", authorizeRoles("TPO"), requireStaffFullName, tpoController.createCoordinator);
router.put("/coordinators/:staff_id/status", authorizeRoles("TPO"), requireStaffFullName, tpoController.updateCoordinatorStatus);
router.delete("/coordinators/:staff_id", authorizeRoles("TPO"), requireStaffFullName, tpoController.deleteCoordinator);
router.get("/policy", authorizeRoles("TPO"), tpoController.getDepartmentPolicy);
router.get("/policy/history", authorizeRoles("TPO"), tpoController.getDepartmentPolicyHistory);
router.put("/policy", authorizeRoles("TPO"), requireStaffFullName, tpoController.updateDepartmentPolicy);

export default router;
