// templateRoutes.js

import express from "express";
import multer from "multer";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
import {
  createTemplate,
  getTemplates,
  getTemplatesByCategory,
} from "../controllers/templateShotController.js";

const router = express.Router();

// Memory storage (files available in req.files)
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "images", maxCount: 20 }, // Template images
    { name: "shots", maxCount: 1 }, // Single shot image
  ]),
  createTemplate,
);

router.get("/", getTemplates);
router.get("/by-category/:slug", getTemplatesByCategory);

export default router;
