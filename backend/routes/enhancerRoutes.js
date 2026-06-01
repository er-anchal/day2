import express from 'express';
import {
  uploadEnhancer,
  enhanceImage,
  enhanceVideo,
  videoJobStatus,
  downloadEnhanced,
} from '../controllers/enhancerController.js';

const router = express.Router();

router.post('/image',                    uploadEnhancer.single('file'), enhanceImage);
router.post('/video',                    uploadEnhancer.single('file'), enhanceVideo);
router.get('/video/status/:jobId',       videoJobStatus);
router.get('/download/:filename',        downloadEnhanced);

export default router;
