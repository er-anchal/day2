import express from 'express';
import { getTemplates, getSamples, generateJewellery, uploadJewellery } from '../controllers/jewelleryController.js';

const router = express.Router();

// GET /api/jewellery/templates
router.get('/templates', getTemplates);

// GET /api/jewellery/samples
router.get('/samples', getSamples);

// POST /api/jewellery/generate
router.post(
  '/generate',
  uploadJewellery.fields([
    { name: 'jewelleryImage', maxCount: 1 },
    { name: 'ringImage', maxCount: 1 },
    { name: 'bangleImage', maxCount: 1 }
  ]),
  generateJewellery
);

export default router;
