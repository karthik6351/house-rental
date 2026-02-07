const express = require('express');
const router = express.Router();
const {
    createProperty,
    getMyProperties,
    updateProperty,
    deleteProperty,
    toggleAvailability,
    searchProperties,
    getProperty,
    getReverseGeocode
} = require('../controllers/propertyController');
const { authenticate, requireOwner, requireTenant } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { createPropertyLimiter } = require('../config/rateLimiter');

// Owner routes
router.post(
    '/',
    authenticate,
    requireOwner,
    createPropertyLimiter,
    upload.array('images', 10),
    handleUploadError,
    createProperty
);

router.get('/my-properties', authenticate, requireOwner, getMyProperties);

router.put(
    '/:id',
    authenticate,
    requireOwner,
    upload.array('images', 10),
    handleUploadError,
    updateProperty
);

router.delete('/:id', authenticate, requireOwner, deleteProperty);

router.patch('/:id/availability', authenticate, requireOwner, toggleAvailability);

// Tenant routes (now accessible to all authenticated users for better UX/Debugging)
router.get('/search', authenticate, searchProperties);

// Utility routes (both roles)
router.get('/reverse-geocode', authenticate, getReverseGeocode);

// Both roles
router.get('/:id', authenticate, getProperty);

module.exports = router;
