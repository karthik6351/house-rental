const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch full user from database for suspension check
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Check if user is suspended
        if (user.suspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        // Attach full user to request
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Authentication failed.',
            error: error.message
        });
    }
};

// Alias for authenticate (used by new routes)
const verifyToken = authenticate;

// Require owner role
const requireOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'owner') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. Owner role required.'
        });
    }

    next();
};

// Require tenant role
const requireTenant = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'tenant') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. Tenant role required.'
        });
    }

    next();
};

// Require admin role
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden. Admin role required.'
        });
    }

    next();
};

// Allow both roles (just needs to be authenticated)
const requireAuth = authenticate;

module.exports = {
    authenticate,
    verifyToken,
    requireOwner,
    requireTenant,
    requireAdmin,
    requireAuth
};
