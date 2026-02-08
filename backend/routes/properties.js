const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();
const { authenticate, requireOwner } = require('../middleware/auth');
const { getUpload, optimizeImages } = require('../middleware/uploadGridFS');
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
    authenticate,
    requireOwner,
    createPropertyLimiter,
    (req, res, next) => {
        // Get upload instance dynamically after GridFS is initialized
        const upload = getUpload();
        upload.array('images', 10)(req, res, next);
    },
    optimizeImages,
    createProperty
);

// @route   GET /api/properties/my-properties
// @desc    Get all properties for logged-in owner
// @access  Private (Owner only)
router.get('/my-properties', authenticate, requireOwner, getMyProperties);

// @route   GET /api/properties/deleted
// @desc    Get deleted properties for owner
// @access  Private (Owner only)
router.get('/deleted', authenticate, requireOwner, getDeletedProperties);

// @route   GET /api/properties/search
// @desc    Search properties (Tenant)
// @access  Private
router.get('/search', authenticate, searchProperties);

// @route   GET /api/properties/reverse-geocode
// @desc    Get address from coordinates
// @access  Private
router.get('/reverse-geocode', authenticate, getReverseGeocode);

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Private
router.get('/:id', authenticate, getProperty);

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner only)
router.put(
    '/:id',
    authenticate,
    requireOwner,
    (req, res, next) => {
        // Get upload instance dynamically after GridFS is initialized
        const upload = getUpload();
        upload.array('images', 10)(req, res, next);
    },
    optimizeImages,
    updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Soft delete property
// @access  Private (Owner only)
router.delete('/:id', authenticate, requireOwner, deleteProperty);

// @route   PATCH /api/properties/:id/availability
// @desc    Toggle property availability
// @access  Private (Owner only)
router.patch('/:id/availability', authenticate, requireOwner, toggleAvailability);

// @route   PATCH /api/properties/:id/restore
// @desc    Restore deleted property
// @access  Private (Owner only)
router.patch('/:id/restore', authenticate, requireOwner, restoreProperty);

module.exports = router;
