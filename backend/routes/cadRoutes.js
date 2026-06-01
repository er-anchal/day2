import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getCadTemplates,
  getPresets,
  uploadCadTemplate,
  deleteCadTemplate
} from "../controllers/cadController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Disk storage for CAD STL uploads
const UPLOAD_DIR = "uploads/cad";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for heavy 3D assets
}).fields([
  { name: "stlFile", maxCount: 1 },
  { name: "productionFile", maxCount: 1 },
  { name: "additionalFiles", maxCount: 10 }
]);

// Public endpoints
router.get("/templates", getCadTemplates);
router.get("/presets", getPresets);

// Admin-protected endpoints
router.post("/upload", authMiddleware, adminMiddleware, upload, uploadCadTemplate);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCadTemplate);

export default router;
