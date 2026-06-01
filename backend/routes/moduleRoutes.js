import express from "express";
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

const router = express.Router();

// Create module
router.post("/", createModule);

// Get all active modules
router.get("/", getModules);

// Get module by ID
router.get("/:id", getModuleById);

// Update module
router.put("/:id", updateModule);

// Soft delete module
router.delete("/:id", deleteModule);

export default router;
