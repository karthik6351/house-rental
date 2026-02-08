const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Create a review for a property
// @route   POST /api/reviews
// @access  Private (Tenant only)
const createReview = async (req, res) => {
    try {
        const { propertyId, rating, comment } = req.body;
        const tenantId = req.user.userId;

        // Validate inputs
        if (!propertyId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide property ID, rating, and comment'
            });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check if tenant already reviewed this property
        const existingReview = await Review.findOne({ property: propertyId, tenant: tenantId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this property. You can update your existing review instead.'
            });
        }

        // Create review
        const review = await Review.create({
            property: propertyId,
            tenant: tenantId,
            rating: parseFloat(rating),
            comment
        });

        await review.populate('tenant', 'name');

        // Update property rating statistics
        await updatePropertyRating(propertyId);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review
        });

    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getPropertyReviews = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ property: propertyId })
            .populate('tenant', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ property: propertyId });

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            averageRating: property.averageRating,
            totalReviews: property.totalReviews,
            reviews
        });

    } catch (error) {
        console.error('Get property reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Tenant - own review only)
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const tenantId = req.user.userId;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Verify ownership
        if (review.tenant.toString() !== tenantId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        // Update fields
        if (rating) review.rating = parseFloat(rating);
        if (comment) review.comment = comment;

        await review.save();
        await review.populate('tenant', 'name');

        // Update property rating statistics
        await updatePropertyRating(review.property);

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Tenant - own review only)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.userId;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Verify ownership
        if (review.tenant.toString() !== tenantId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        const propertyId = review.property;
        await review.deleteOne();

        // Update property rating statistics
        await updatePropertyRating(propertyId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// @desc    Get user's review for a property
// @route   GET /api/reviews/my-review/:propertyId
// @access  Private (Tenant only)
const getMyReview = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const tenantId = req.user.userId;

        const review = await Review.findOne({ property: propertyId, tenant: tenantId })
            .populate('tenant', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'You have not reviewed this property yet'
            });
        }

        res.status(200).json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Get my review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your review',
            error: error.message
        });
    }
};

// Helper function to update property rating statistics
const updatePropertyRating = async (propertyId) => {
    try {
        const reviews = await Review.find({ property: propertyId });
        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            await Property.findByIdAndUpdate(propertyId, {
                averageRating: 0,
                totalReviews: 0
            });
            return;
        }

        const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((sumRatings / totalReviews) * 10) / 10; // Round to 1 decimal

        await Property.findByIdAndUpdate(propertyId, {
            averageRating,
            totalReviews
        });

    } catch (error) {
        console.error('Update property rating error:', error);
    }
};

module.exports = {
    createReview,
    getPropertyReviews,
    updateReview,
    deleteReview,
    getMyReview
};
