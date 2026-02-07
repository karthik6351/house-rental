const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL index to automatically delete expired tokens after 1 hour
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

// Static method to generate reset token
passwordResetSchema.statics.createResetToken = async function (userId) {
    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for storage
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiry to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any existing tokens for this user
    await this.deleteMany({ user: userId, used: false });

    // Create new reset token
    await this.create({
        user: userId,
        token: hashedToken,
        expiresAt
    });

    // Return unhashed token (to send in email)
    return resetToken;
};

// Static method to verify reset token
passwordResetSchema.statics.verifyToken = async function (token) {
    // Hash the provided token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find valid token
    const resetToken = await this.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
        used: false
    }).populate('user');

    return resetToken;
};

// Method to mark token as used
passwordResetSchema.methods.markAsUsed = async function () {
    this.used = true;
    this.usedAt = new Date();
    await this.save();
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
