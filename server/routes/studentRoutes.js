import express from "express";
import { getMe, getVerificationStatus, getAcceptedOffers, uploadOfferLetter } from "../contollers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles("Student"));

router.get("/me", getMe);
router.get("/verification-status", getVerificationStatus);
router.get("/offers/accepted", getAcceptedOffers);
router.post("/offers/upload-letter", uploadOfferLetter);

export default router;
