import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = 'uploads/faq/other';
        
        if (file.mimetype.startsWith('image/')) {
            uploadDir = 'uploads/faq/images';
        } else if (file.mimetype.startsWith('video/')) {
            uploadDir = 'uploads/faq/videos';
        } else if (file.mimetype === 'application/pdf') {
            uploadDir = 'uploads/faq/pdfs';
        }

        createDirIfNotExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'file-';
        if (file.mimetype.startsWith('image/')) prefix = 'img-';
        else if (file.mimetype.startsWith('video/')) prefix = 'vid-';
        else if (file.mimetype === 'application/pdf') prefix = 'pdf-';
        
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images, videos, and PDFs are allowed.'), false);
    }
};

const faqUpload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit to allow video uploads
});

export default faqUpload;
