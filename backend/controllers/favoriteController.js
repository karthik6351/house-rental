const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Toggle favorite (add/remove)
// @route   POST /api/favorites/:propertyId
// @access  Private (Tenant only)
exports.toggleFavorite = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.id; // From auth middleware

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check if already favorite
        const existingFavorite = await Favorite.findOne({
            user: userId,
            property: propertyId
        });

        if (existingFavorite) {
            // Remove from favorites
            await Favorite.findByIdAndDelete(existingFavorite._id);
            return res.status(200).json({
                success: true,
                isFavorite: false,
                message: 'Removed from favorites'
            });
        } else {
            // Add to favorites
            await Favorite.create({
                user: userId,
                property: propertyId
            });
            return res.status(201).json({
                success: true,
                isFavorite: true,
                message: 'Added to favorites'
            });
        }

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating favorites'
        });
    }
};

// @desc    Get my favorites
// @route   GET /api/favorites
// @access  Private (Tenant only)
exports.getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate({
                path: 'property',
                select: 'title price address images bedrooms bathrooms area furnishing location'
            })
            .sort('-createdAt');

        // Filter out favorites where property might have been deleted
        const validFavorites = favorites.filter(fav => fav.property != null);

        res.status(200).json({
            success: true,
            count: validFavorites.length,
            favorites: validFavorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching favorites'
        });
    }
};

// @desc    Check favorite status
// @route   GET /api/favorites/:propertyId/status
// @access  Private
exports.checkFavoriteStatus = async (req, res) => {
    try {
        const { propertyId } = req.params;

        const isFavorite = await Favorite.exists({
            user: req.user.id,
            property: propertyId
        });

        res.status(200).json({
            success: true,
            isFavorite: !!isFavorite
        });
    } catch (error) {
        console.error('Check favorite status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
