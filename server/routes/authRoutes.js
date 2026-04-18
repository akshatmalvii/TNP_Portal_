import express from "express";
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  logout
} from "../contollers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/validate", validateResetToken);
router.post("/reset-password", resetPassword);
router.get("/me", verifyToken, getCurrentUser);
router.put("/me", verifyToken, updateCurrentUser);

export default router;
