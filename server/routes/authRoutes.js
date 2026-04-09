import express from "express";
import {
  register,
  login,
  forgotPassword,
  validateResetToken,
  resetPassword,
} from "../contollers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/validate", validateResetToken);
router.post("/reset-password", resetPassword);

export default router;
