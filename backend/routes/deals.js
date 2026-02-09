const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    confirmDeal,
    getReceipts,
    getReceiptById,
    cancelDeal,
    updatePropertyStatus
} = require('../controllers/dealController');

// All routes require authentication
router.use(verifyToken);

// Deal confirmation
router.post('/confirm', confirmDeal);

// Receipts
router.get('/receipts', getReceipts);
router.get('/receipts/:id', getReceiptById);
router.patch('/receipts/:id/cancel', cancelDeal);

// Property status management (also accessible via /api/properties/:id/status)
router.patch('/properties/:id/status', updatePropertyStatus);

module.exports = router;
