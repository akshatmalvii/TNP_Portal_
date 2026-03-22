import express from "express";
import { register, login } from "../contollers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
