import express from "express";
import multer from "multer";
import {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
  uploadSubCategoryImages,
} from "../controllers/subCategoryController.js";

import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
const upload = multer();
const router = express.Router();

/* ---------------- CREATE (ADMIN ONLY) ---------------- */
router.post("/", authMiddleware, adminMiddleware, createSubCategory);

/* ---------------- GET ALL ---------------- */
router.get("/", authMiddleware, getSubCategories);

/* ---------------- GET BY CATEGORY ---------------- */
router.get("/category/:categoryId", authMiddleware, getSubCategoriesByCategory);

/* ---------------- UPDATE ---------------- */
router.put("/:id", authMiddleware, adminMiddleware, updateSubCategory);

// upload
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  uploadSubCategoryImages,
);
/* ---------------- DELETE ---------------- */
router.delete("/:id", authMiddleware, adminMiddleware, deleteSubCategory);

export default router;
