import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/image', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Koi image upload nahi hui!' });
        }

        const fileUrl = `/uploads/images/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image successfully saved!',
            filePath: fileUrl,
            localPath: req.file.path 
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

import faqUpload from '../middleware/faqUploadMiddleware.js';

router.post('/faq-media', faqUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded!' });
        }

        let folder = 'other';
        if (req.file.mimetype.startsWith('image/')) folder = 'images';
        else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
        else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';

        const fileUrl = `/uploads/faq/${folder}/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'File successfully saved!',
            fileUrl: fileUrl
        });

    } catch (error) {
        console.error('FAQ Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during FAQ upload' });
    }
});

export default router;