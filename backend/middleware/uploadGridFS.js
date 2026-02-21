const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

// GridFS setup
let gfs, gridfsBucket, storage, upload;

// Initialize GridFS with the media database connection
const initGridFS = (mediaConn) => {
    // Use media connection if provided, otherwise fall back to default mongoose connection
    const conn = mediaConn || mongoose.connection;

    if (conn.readyState === 1) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'propertyImages'
        });

        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('propertyImages');

        // Initialize storage after connection is established
        if (!storage) {
            storage = new GridFsStorage({
                db: conn.db,
                file: (req, file) => {
                    // Return a Promise for async file metadata generation
                    return new Promise((resolve, reject) => {
                        const filename = `${Date.now()}-${file.originalname}`;
                        const fileInfo = {
                            filename: filename,
                            bucketName: 'propertyImages',
                            metadata: {
                                originalName: file.originalname,
                                uploadedBy: req.user?.userId,
                                uploadedAt: new Date()
                            }
                        };
                        resolve(fileInfo);
                    });
                }
            });

            // File filter - only allow images
            const fileFilter = (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
                }
            };

            // Configure multer with GridFS storage
            upload = multer({
                storage: storage,
                fileFilter: fileFilter,
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10MB
                    files: 10
                }
            });
        }

        console.log('✅ GridFS initialized successfully');
    } else {
        console.error('❌ MongoDB Media not connected, GridFS initialization failed');
    }
};

// Middleware to optimize images after upload to GridFS
const optimizeImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const optimizedFileIds = [];

        for (const file of req.files) {
            // Download the file from GridFS
            const downloadStream = gridfsBucket.openDownloadStream(file.id);
            const chunks = [];

            for await (const chunk of downloadStream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            // Optimize with Sharp
            const optimizedBuffer = await sharp(buffer)
                .resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 85 })
                .toBuffer();

            // Delete the original file
            await gridfsBucket.delete(file.id);

            // Upload optimized version
            const optimizedFilename = `optimized-${file.filename.replace(/\.[^/.]+$/, '')}.webp`;
            const uploadStream = gridfsBucket.openUploadStream(optimizedFilename, {
                metadata: {
                    originalName: file.originalname,
                    uploadedBy: req.user?.userId,
                    uploadedAt: new Date(),
                    optimized: true,
                    originalSize: file.size,
                    optimizedSize: optimizedBuffer.length
                }
            });

            uploadStream.end(optimizedBuffer);

            await new Promise((resolve, reject) => {
                uploadStream.on('finish', () => {
                    optimizedFileIds.push(uploadStream.id.toString());
                    console.log(`📸 Optimized: ${file.originalname} (${file.size} → ${optimizedBuffer.length} bytes)`);
                    resolve();
                });
                uploadStream.on('error', reject);
            });
        }

        // Attach optimized file IDs to request
        req.optimizedFileIds = optimizedFileIds;
        next();

    } catch (error) {
        console.error('Image optimization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to optimize images',
            error: error.message
        });
    }
};


// Get upload instance (must be called after initGridFS)
const getUpload = () => {
    if (!upload) {
        throw new Error('Upload not initialized. Call initGridFS() first.');
    }
    return upload;
};

// Get GridFS bucket instance
const getGridFSBucket = () => gridfsBucket;

module.exports = {
    getUpload,
    optimizeImages,
    initGridFS,
    getGridFSBucket
};
