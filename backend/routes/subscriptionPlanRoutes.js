import express from "express";
const router = express.Router();
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/subscriptionPlanController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

router.get("/", getAllPlans);

router.post("/", authMiddleware, adminMiddleware, createPlan);
router.put("/:id", authMiddleware, adminMiddleware, updatePlan);
router.delete("/:id", authMiddleware, adminMiddleware, deletePlan);

export default router;
