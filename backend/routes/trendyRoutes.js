import express from 'express';
import { uploadTrendy, generateTrendyTemplate } from '../controllers/trendyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to generate trendy templates
router.post('/generate', authMiddleware, uploadTrendy.single('image'), generateTrendyTemplate);

export default router;
