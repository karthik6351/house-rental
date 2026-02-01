const Property = require('../models/Property');
const axios = require('axios');

// Geocode address using Google Maps API
const geocodeAddress = async (address) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
            // For development without API key, return default coordinates
            console.warn('⚠️  Google Maps API key not configured. Using default coordinates.');
            return { lat: 0, lng: 0 };
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    address: address,
                    key: apiKey
                }
            }
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        }

        throw new Error('Unable to geocode address');
    } catch (error) {
        console.error('Geocoding error:', error.message);
        throw new Error('Failed to geocode address. Please check the address and try again.');
    }
};

// Reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
            console.warn('⚠️  Google Maps API key not configured. Using Nominatim (OpenStreetMap).');
            // Fallback to Nominatim
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse`,
                {
                    params: {
                        lat: lat,
                        lon: lng,
                        format: 'json',
                        addressdetails: 1
                    },
                    headers: {
                        'User-Agent': 'HouseRentalApp/1.0'
                    }
                }
            );

            if (response.data && response.data.display_name) {
                return response.data.display_name;
            }
            return 'Address not available';
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    latlng: `${lat},${lng}`,
                    key: apiKey
                }
            }
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }

        throw new Error('Unable to reverse geocode coordinates');
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        throw new Error('Failed to get address from coordinates');
    }
};


// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
const createProperty = async (req, res) => {
    try {
        console.log('Create Property Request Body:', req.body);
        console.log('Create Property Files:', req.files ? req.files.length : 0);
        const {
            title,
            description,
            address,
            price,
            bedrooms,
            bathrooms,
            area,
            furnishing,
            lat: providedLat,
            lng: providedLng
        } = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'address', 'price', 'bedrooms', 'bathrooms', 'area', 'furnishing'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Please provide all required fields: ${missingFields.join(', ')}`
            });
        }

        // Use provided coordinates or geocode address
        let lat, lng;
        if (providedLat && providedLng) {
            lat = parseFloat(providedLat);
            lng = parseFloat(providedLng);

            // Check if coordinates are valid numbers
            if (isNaN(lat) || isNaN(lng)) {
                console.warn('Invalid coordinates provided, falling back to address geocoding');
                const coords = await geocodeAddress(address);
                lat = coords.lat;
                lng = coords.lng;
            }
        } else {
            const coords = await geocodeAddress(address);
            lat = coords.lat;
            lng = coords.lng;
        }


        // Get uploaded image paths
        const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];

        // Create property
        const property = await Property.create({
            owner: req.user.userId,
            title,
            description,
            address,
            location: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
            },
            price: parseFloat(price),
            bedrooms: parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            area: parseFloat(area),
            furnishing,
            images
        });

        // Populate owner details
        await property.populate('owner', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            property
        });

    } catch (error) {
        console.error('Create property error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create property',
            error: error.message
        });
    }
};

// @desc    Get all properties for logged-in owner
// @route   GET /api/properties/my-properties
// @access  Private (Owner only)
const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('owner', 'name email phone');

        res.status(200).json({
            success: true,
            count: properties.length,
            properties
        });

    } catch (error) {
        console.error('Get my properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: error.message
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            address,
            price,
            bedrooms,
            bathrooms,
            area,
            furnishing,
            available
        } = req.body;

        // Find property
        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Verify ownership
        if (property.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this property'
            });
        }

        // Update fields
        if (title) property.title = title;
        if (description) property.description = description;
        if (price) property.price = parseFloat(price);
        if (bedrooms) property.bedrooms = parseInt(bedrooms);
        if (bathrooms) property.bathrooms = parseInt(bathrooms);
        if (area) property.area = parseFloat(area);
        if (furnishing) property.furnishing = furnishing;
        if (typeof available !== 'undefined') property.available = available;

        // Update address and coordinates if address changed
        if (address && address !== property.address) {
            const { lat, lng } = await geocodeAddress(address);
            property.address = address;
            property.location = {
                type: 'Point',
                coordinates: [lng, lat]
            };
        }

        // Update images if new ones uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/properties/${file.filename}`);
            property.images = [...property.images, ...newImages].slice(0, 10); // Max 10 images
        }

        await property.save();
        await property.populate('owner', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            property
        });

    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property',
            error: error.message
        });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Find property
        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Verify ownership
        if (property.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this property'
            });
        }

        await property.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });

    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete property',
            error: error.message
        });
    }
};

// @desc    Toggle property availability
// @route   PATCH /api/properties/:id/availability
// @access  Private (Owner only)
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Verify ownership
        if (property.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to modify this property'
            });
        }

        property.available = !property.available;
        await property.save();

        res.status(200).json({
            success: true,
            message: `Property marked as ${property.available ? 'available' : 'unavailable'}`,
            property
        });

    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property availability',
            error: error.message
        });
    }
};

// @desc    Search properties (Tenant)
// @route   GET /api/properties/search
// @access  Private (Tenant only)
const searchProperties = async (req, res) => {
    try {
        const {
            lat,
            lng,
            radius = 10, // Default 10km
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            furnishing,
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = { available: true };

        // Location-based search
        if (lat && lng) {
            const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInMeters
                }
            };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Bedrooms filter
        if (bedrooms) {
            query.bedrooms = parseInt(bedrooms);
        }

        // Bathrooms filter
        if (bathrooms) {
            query.bathrooms = parseInt(bathrooms);
        }

        // Furnishing filter
        if (furnishing) {
            query.furnishing = furnishing;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const properties = await Property.find(query)
            .populate('owner', 'name email phone')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count
        const total = await Property.countDocuments(query);

        res.status(200).json({
            success: true,
            count: properties.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            properties
        });

    } catch (error) {
        console.error('Search properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search properties',
            error: error.message
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
const getProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id).populate('owner', 'name email phone');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            property
        });

    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property',
            error: error.message
        });
    }
};

// @desc    Get address from coordinates (Reverse Geocode)
// @route   GET /api/properties/reverse-geocode
// @access  Private
const getReverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const address = await reverseGeocode(parseFloat(lat), parseFloat(lng));

        res.status(200).json({
            success: true,
            address
        });

    } catch (error) {
        console.error('Reverse geocode error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get address from coordinates',
            error: error.message
        });
    }
};

module.exports = {
    createProperty,
    getMyProperties,
    updateProperty,
    deleteProperty,
    toggleAvailability,
    searchProperties,
    getProperty,
    getReverseGeocode
};

