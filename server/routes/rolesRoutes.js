import express from "express";
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from "../contollers/rolesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// router.use(verifyToken);
// router.use(authorizeRoles("MASTER_ADMIN")); // Only MASTER_ADMIN can manage roles

router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;