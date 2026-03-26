import express from "express";
import tpoController from "../controllers/tpoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("TPO", "TPO_Head"));

// TPO Drive Creation
router.get("/companies", tpoController.getCompanies);
router.get("/drives", tpoController.getDrives);
router.get("/drive/:id", tpoController.getDrive);
router.post("/company", tpoController.createCompany);
router.post("/drive", tpoController.createDrive);
router.put("/drive/:id", tpoController.updateDrive);
router.delete("/drive/:id", tpoController.deleteDrive);

export default router;
