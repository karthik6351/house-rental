const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Message must be associated with a property']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a sender']
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a receiver']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        minlength: [1, 'Message cannot be empty'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
messageSchema.index({ property: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 }); // For unread messages

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
