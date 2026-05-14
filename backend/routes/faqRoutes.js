import express from "express";
import {
  getAllFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq
} from "../controllers/faqController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllFaqs);

// Admin routes
router.get("/admin", authMiddleware, adminMiddleware, getAdminFaqs);
router.post("/", authMiddleware, adminMiddleware, createFaq);
router.put("/:id", authMiddleware, adminMiddleware, updateFaq);
router.delete("/:id", authMiddleware, adminMiddleware, deleteFaq);

export default router;
