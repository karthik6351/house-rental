const express = require('express');
const router = express.Router();
const { authenticate, requireTenant } = require('../middleware/auth');
const {
    createReview,
    getPropertyReviews,
    updateReview,
    deleteReview,
    getMyReview
} = require('../controllers/reviewController');

// Public routes
router.get('/property/:propertyId', getPropertyReviews);

// Protected routes - Tenant only
router.post('/', authenticate, requireTenant, createReview);
router.get('/my-review/:propertyId', authenticate, requireTenant, getMyReview);
router.put('/:id', authenticate, requireTenant, updateReview);
router.delete('/:id', authenticate, requireTenant, deleteReview);

module.exports = router;
