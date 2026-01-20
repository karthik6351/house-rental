const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendMessage
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All chat routes require authentication
router.get('/conversations', authenticate, getConversations);
router.get('/messages/:propertyId/:otherUserId', authenticate, getMessages);
router.post('/messages', authenticate, sendMessage);

module.exports = router;
