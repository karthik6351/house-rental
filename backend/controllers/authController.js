const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, password, phone, role'
            });
        }

        // Validate role
        if (!['owner', 'tenant'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either "owner" or "tenant"'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        // Return user data (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle validation errors
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
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Return user data (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists for security
            return res.status(200).json({
                success: true,
                message: 'If an account exists with that email, a password reset link has been sent'
            });
        }

        // Generate reset token
        const PasswordReset = require('../models/PasswordReset');
        const resetToken = await PasswordReset.createResetToken(user._id);

        // Send email
        const { sendPasswordResetEmail } = require('../utils/sendEmail');
        await sendPasswordResetEmail(user.email, resetToken, user.name);

        res.status(200).json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error.message
        });
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const PasswordReset = require('../models/PasswordReset');
        const resetToken = await PasswordReset.verifyToken(token);

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            email: resetToken.user.email
        });

    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify reset token',
            error: error.message
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Verify token
        const PasswordReset = require('../models/PasswordReset');
        const resetToken = await PasswordReset.verifyToken(token);

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update user password
        const user = await User.findById(resetToken.user._id);
        user.password = password;
        await user.save();

        // Mark token as used
        await resetToken.markAsUsed();

        // Generate new auth token
        const authToken = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            token: authToken,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    verifyResetToken,
    resetPassword
};
