const mongoose = require('mongoose');

const dealReceiptSchema = new mongoose.Schema({
    // Unique receipt identifier (e.g., "DEAL-2026-001234")
    receiptId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Snapshot of property details at time of deal
    propertySnapshot: {
        title: String,
        address: String,
        description: String,
        bedrooms: Number,
        bathrooms: Number,
        area: Number,
        furnishing: String
    },
    agreedRent: {
        type: Number,
        required: [true, 'Agreed rent is required'],
        min: [0, 'Rent cannot be negative']
    },
    securityDeposit: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative']
    },
    leaseStartDate: {
        type: Date
    },
    leaseDuration: {
        type: Number, // in months
        default: 12
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    confirmedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    // Terms agreed upon
    terms: [{
        key: String,
        value: String
    }]
}, {
    timestamps: true
});

// Generate unique receipt ID
dealReceiptSchema.statics.generateReceiptId = async function () {
    const year = new Date().getFullYear();
    const count = await this.countDocuments({
        createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`)
        }
    });
    const sequence = String(count + 1).padStart(6, '0');
    return `DEAL-${year}-${sequence}`;
};

// Pre-save hook to generate receiptId if not set
dealReceiptSchema.pre('save', async function (next) {
    if (!this.receiptId) {
        this.receiptId = await this.constructor.generateReceiptId();
    }
    next();
});

// Virtual for formatted date
dealReceiptSchema.virtual('formattedDate').get(function () {
    return this.confirmedAt.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Ensure virtuals are included
dealReceiptSchema.set('toJSON', { virtuals: true });
dealReceiptSchema.set('toObject', { virtuals: true });

// Compound index for quick lookups
dealReceiptSchema.index({ owner: 1, confirmedAt: -1 });
dealReceiptSchema.index({ tenant: 1, confirmedAt: -1 });

const DealReceipt = mongoose.model('DealReceipt', dealReceiptSchema);

module.exports = DealReceipt;
