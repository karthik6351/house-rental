const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getLeads,
    getLeadById,
    updateLead,
    addNote,
    getOwnerAnalytics
} = require('../controllers/leadController');

// All routes require authentication
router.use(verifyToken);

// Get all leads (owner only)
router.get('/', getLeads);

// Get owner analytics
router.get('/analytics', getOwnerAnalytics);

// Get single lead
router.get('/:id', getLeadById);

// Update lead
router.patch('/:id', updateLead);

// Add note to lead
router.post('/:id/notes', addNote);

module.exports = router;
