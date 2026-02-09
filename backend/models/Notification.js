const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['message', 'approval', 'rejection', 'deal_confirmed', 'enquiry', 'status_change', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    body: {
        type: String,
        maxlength: [500, 'Body cannot exceed 500 characters']
    },
    // Related entities for deep linking
    relatedProperty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedReceipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealReceipt'
    },
    // Action URL for frontend navigation
    actionUrl: {
        type: String
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date
    },
    // For grouping similar notifications
    category: {
        type: String,
        enum: ['chat', 'property', 'deal', 'system'],
        default: 'system'
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Auto-expire old read notifications after 30 days
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { read: true } });

// Static method to create notification
notificationSchema.statics.createNotification = async function ({
    userId,
    type,
    title,
    body,
    relatedProperty,
    relatedUser,
    relatedReceipt,
    actionUrl,
    category
}) {
    const notification = await this.create({
        user: userId,
        type,
        title,
        body,
        relatedProperty,
        relatedUser,
        relatedReceipt,
        actionUrl,
        category: category || 'system'
    });

    return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ user: userId, read: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
    if (!this.read) {
        this.read = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
