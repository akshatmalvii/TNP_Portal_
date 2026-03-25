import express from "express";
import {
  getProfile,
  updateProfile,
  addEducation,
  deleteEducation,
  uploadDocument,
  deleteDocument,
  submitForVerification,
} from "../contollers/studentProfileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes require Student role
router.use(verifyToken);
router.use(authorizeRoles("Student"));

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Education
router.post("/education", addEducation);
router.delete("/education/:id", deleteEducation);

// Documents (file upload via multer)
router.post("/documents", upload.single("file"), uploadDocument);
router.delete("/documents/:id", deleteDocument);

// Verification submission
router.post("/submit-verification", submitForVerification);

export default router;
