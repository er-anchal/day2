import express from "express";
import {
  deleteTemplate,
  getTemplateCategories,
  getTemplatesByCategorySlug,
  getTemplateById,
  getDiskTemplates,
} from "../controllers/templateController.js";

import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

import { globalSearch } from "../controllers/globalSearch.js";

const router = express.Router();

router.get("/disk-templates", authMiddleware, getDiskTemplates);

router.get("/by-category/:slug", authMiddleware, getTemplatesByCategorySlug);

router.get("/:id", authMiddleware, getTemplateById);

router.get("/", authMiddleware, adminMiddleware, getTemplateCategories);

router.delete("/:id", authMiddleware, adminMiddleware, deleteTemplate);

router.get("/search", globalSearch);

export default router;
