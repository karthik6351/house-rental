const express = require('express');
const router = express.Router();
const {
    createProperty,
    getMyProperties,
    updateProperty,
    deleteProperty,
    toggleAvailability,
    searchProperties,
    getProperty
} = require('../controllers/propertyController');
const { authenticate, requireOwner, requireTenant } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Owner routes
router.post(
    '/',
    authenticate,
    requireOwner,
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

// Tenant routes
router.get('/search', authenticate, requireTenant, searchProperties);

// Both roles
router.get('/:id', authenticate, getProperty);

module.exports = router;
