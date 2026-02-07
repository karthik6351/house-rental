const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads/properties';
if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for multer (we'll process with Sharp before saving)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default (before optimization)
        files: 10
    }
});

// Middleware to process images with Sharp
const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const processedFiles = [];

        for (const file of req.files) {
            // Generate unique filename with .webp extension
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = file.fieldname + '-' + uniqueSuffix + '.webp';
            const filepath = path.join(uploadDir, filename);

            // Process image with Sharp
            await sharp(file.buffer)
                .resize(1920, 1080, {
                    fit: 'inside', // Maintain aspect ratio, fit within 1920x1080
                    withoutEnlargement: true // Don't upscale smaller images
                })
                .webp({ quality: 85 }) // Convert to WebP with 85% quality
                .toFile(filepath);

            // Create a new file object with updated properties
            processedFiles.push({
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: 'image/webp',
                filename: filename,
                path: filepath,
                size: (await fs.stat(filepath)).size
            });

            console.log(`📸 Optimized image: ${file.originalname} -> ${filename}`);
        }

        // Replace req.files with processed files
        req.files = processedFiles;
        next();

    } catch (error) {
        console.error('Image processing error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process images',
            error: error.message
        });
    }
};

// Error handler for multer errors
const handleUploadError = (err, req, res, next) => {
    console.error('Multer Upload Error:', err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB per image.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 images allowed.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next();
};

module.exports = {
    upload,
    processImages,
    handleUploadError
};
