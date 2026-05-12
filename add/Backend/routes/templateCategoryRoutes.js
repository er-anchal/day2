// routes/categoryRoutes.js
import multer from "multer";
import express from "express";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
import {
  createCategory,
  deleteCategory,
  getLandingCategory,
  getTemplateCategories,
  updateCategory,
  uploadCategoryImages,
} from "../controllers/templateCategoryController.js";

const upload = multer(); // memory storage
const router = express.Router();

router.get("/landing", getLandingCategory);
// Create category (ADMIN)
router.post("/", authMiddleware, adminMiddleware, createCategory);
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  uploadCategoryImages,
);

router.get("/", authMiddleware, getTemplateCategories);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
