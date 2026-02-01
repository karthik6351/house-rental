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
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
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
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Location coordinates are required']
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative'],
        max: [50, 'Bedrooms seems unrealistic']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [0, 'Bathrooms cannot be negative'],
        max: [50, 'Bathrooms seems unrealistic']
    },
    area: {
        type: Number,
        required: [true, 'Area is required'],
        min: [1, 'Area must be at least 1 sq ft']
    },
    furnishing: {
        type: String,
        enum: {
            values: ['furnished', 'semi-furnished', 'unfurnished'],
            message: 'Furnishing must be furnished, semi-furnished, or unfurnished'
        },
        required: [true, 'Furnishing status is required']
    },
    available: {
        type: Boolean,
        default: true
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Maximum 10 images allowed'
        }
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

// GeoJSON index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Index for owner lookup
propertySchema.index({ owner: 1 });

// Index for availability and price (common filters)
propertySchema.index({ available: 1, price: 1 });

// Virtual for property URL (can be used later)
propertySchema.virtual('url').get(function () {
    return `/properties/${this._id}`;
});

// Ensure virtuals are included in JSON
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
