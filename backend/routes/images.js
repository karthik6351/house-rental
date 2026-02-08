const express = require('express');
const router = express.Router();
const { getGridFSBucket } = require('../middleware/uploadGridFS');
const { authenticate } = require('../middleware/auth');

// @desc    Get image from GridFS
// @route   GET /api/images/:fileId
// @access  Public (images should be viewable)
router.get('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { ObjectId } = require('mongodb');

        // Validate ObjectId
        if (!ObjectId.isValid(fileId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file ID'
            });
        }

        const gridfsBucket = getGridFSBucket();

        if (!gridfsBucket) {
            return res.status(500).json({
                success: false,
                message: 'GridFS not initialized'
            });
        }

        // Set appropriate headers for image
        res.set('Content-Type', 'image/webp');
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');

        // Stream the image from GridFS
        const downloadStream = gridfsBucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('error', (error) => {
            console.error('Error streaming image:', error);
            if (!res.headersSent) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }
        });

        downloadStream.pipe(res);

    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve image',
            error: error.message
        });
    }
});

module.exports = router;
