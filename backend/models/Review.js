const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Review must belong to a property']
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must have an author']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [10, 'Review must be at least 10 characters'],
        maxlength: [500, 'Review cannot exceed 500 characters']
    },
    helpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
reviewSchema.index({ property: 1, createdAt: -1 });
reviewSchema.index({ tenant: 1 });

// Ensure one review per tenant per property
reviewSchema.index({ property: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
