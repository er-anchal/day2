import express from "express";
const router = express.Router();
import { getUserPricing } from "../controllers/pricingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


router.get("/my-plan", authMiddleware, getUserPricing);

export default router;