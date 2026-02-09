const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Property must have an owner']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: false,  // Made optional
        trim: true,
        default: 'No description provided',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            index: '2dsphere'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    bedrooms: {
        type: Number,
        required: false,  // Made optional
        default: 1,
        min: [0, 'Bedrooms cannot be negative'],
        max: [50, 'Bedrooms cannot exceed 50']
    },
    bathrooms: {
        type: Number,
        required: false,  // Made optional
        default: 1,
        min: [0, 'Bathrooms cannot be negative'],
        max: [20, 'Bathrooms cannot exceed 20']
    },
    area: {
        type: Number,
        required: false,  // Made optional
        default: 0,
        min: [0, 'Area cannot be negative']
    },
    furnishing: {
        type: String,
        required: false,
        default: 'unfurnished',
        enum: {
            values: ['fully-furnished', 'semi-furnished', 'unfurnished'],
            message: 'Furnishing must be fully-furnished, semi-furnished, or unfurnished'
        }
    },
    // Property Lifecycle Status
    status: {
        type: String,
        enum: {
            values: ['available', 'in_discussion', 'approved', 'rented', 'archived'],
            message: 'Invalid property status'
        },
        default: 'available',
        index: true
    },
    confirmedTenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rentedAt: {
        type: Date
    },
    archivedAt: {
        type: Date
    },
    available: {
        type: Boolean,
        default: true
    },
    // Soft Delete fields
    deleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Admin visibility control
    hidden: {
        type: Boolean,
        default: false,
        index: true
    },
    hiddenAt: {
        type: Date
    },
    hiddenReason: {
        type: String
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Cannot upload more than 10 images'
        }
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Reviews count cannot be negative']
    },
    views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Geospatial Index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Index for filtering
propertySchema.index({ price: 1, bedrooms: 1, bathrooms: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ createdAt: -1 });

// Query middleware to exclude soft-deleted properties by default
propertySchema.pre(/^find/, function (next) {
    // Check if includeDeleted option is set
    if (!this.getOptions().includeDeleted) {
        this.where({ deleted: false });
    }
    next();
});

// Virtual for property URL (can be used later)
propertySchema.virtual('url').get(function () {
    return `/properties/${this._id}`;
});

// Ensure virtuals are included in JSON
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
