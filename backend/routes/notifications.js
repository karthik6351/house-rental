const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(verifyToken);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Mark single as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;
