const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();
const { protect, requireOwner } = require('../middleware/auth');
const { upload, processImages } = require('../middleware/upload');
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

// Rate limiting for property creation
const createPropertyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 property creations per windowMs
    message: 'Too many properties created from this IP, please try again later'
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Owner only)
router.post(
    '/',
    protect,
    requireOwner,
    createPropertyLimiter,
    upload.array('images', 10),
    processImages,
    createProperty
);

// @route   GET /api/properties/my-properties
// @desc    Get all properties for logged-in owner
// @access  Private (Owner only)
router.get('/my-properties', protect, requireOwner, getMyProperties);

// @route   GET /api/properties/deleted
// @desc    Get deleted properties for owner
// @access  Private (Owner only)
router.get('/deleted', protect, requireOwner, getDeletedProperties);

// @route   GET /api/properties/search
// @desc    Search properties (Tenant)
// @access  Private
router.get('/search', protect, searchProperties);

// @route   GET /api/properties/reverse-geocode
// @desc    Get address from coordinates
// @access  Private
router.get('/reverse-geocode', protect, getReverseGeocode);

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Private
router.get('/:id', protect, getProperty);

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner only)
router.put(
    '/:id',
    protect,
    requireOwner,
    upload.array('images', 10),
    processImages,
    updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Soft delete property
// @access  Private (Owner only)
router.delete('/:id', protect, requireOwner, deleteProperty);

// @route   PATCH /api/properties/:id/availability
// @desc    Toggle property availability
// @access  Private (Owner only)
router.patch('/:id/availability', protect, requireOwner, toggleAvailability);

// @route   PATCH /api/properties/:id/restore
// @desc    Restore deleted property
// @access  Private (Owner only)
router.patch('/:id/restore', protect, requireOwner, restoreProperty);

module.exports = router;
