const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();
const { protect, requireOwner } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
    createProperty,
    getMyProperties,
    updateProperty,
    deleteProperty,
    restoreProperty,
    getDeletedProperties,
    toggleAvailability,
    searchProperties,
    getProperty,
    getReverseGeocode
} = require('../controllers/propertyController');
router.get('/:id', authenticate, getProperty);

module.exports = router;
