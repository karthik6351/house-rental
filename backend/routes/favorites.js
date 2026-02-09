const express = require('express');
const router = express.Router();
const { toggleFavorite, getMyFavorites, checkFavoriteStatus } = require('../controllers/favoriteController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes are protected
router.use(authenticate);

// Toggle favorite (Tenant only usually, but owners might want to save others' properties too)
router.post('/:propertyId', toggleFavorite);

// Get my favorites
router.get('/', getMyFavorites);

// Check if specific property is favorite
router.get('/:propertyId/status', checkFavoriteStatus);

module.exports = router;
