const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
    getUsers,
    toggleUserSuspension,
    getListings,
    toggleListingVisibility,
    getAllReceipts,
    getDashboardStats
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/suspend', toggleUserSuspension);

// Listing management
router.get('/listings', getListings);
router.patch('/listings/:id/visibility', toggleListingVisibility);

// Receipt viewing
router.get('/receipts', getAllReceipts);

module.exports = router;
