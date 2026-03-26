import express from "express";
import tpoController from "../controllers/tpoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("TPO", "TPO_Head"));

// TPO Drive Creation
router.get("/company-roles", tpoController.getCompanyRoles);
router.post("/drive", tpoController.createDrive);

export default router;
