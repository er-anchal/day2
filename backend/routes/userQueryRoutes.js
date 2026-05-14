import express from "express";
import {
  submitQuery,
  getAllQueries,
  updateQueryStatus,
  deleteQuery
} from "../controllers/userQueryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", submitQuery);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllQueries);
router.put("/:id", authMiddleware, adminMiddleware, updateQueryStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteQuery);

export default router;
