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

export default router; // module.exports ki jagah export default