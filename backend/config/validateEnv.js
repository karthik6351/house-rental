const logger = require('../config/logger');

// Validate critical environment variables
const validateEnv = () => {
    const required = [
        'MONGODB_URI',
        'MONGODB_MEDIA_URI',
        'JWT_SECRET',
        'PORT'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET.length < 32) {
        logger.warn('⚠️  JWT_SECRET is too short! Recommended length: 32+ characters');
    }

    // Validate MongoDB URI formats
    if (!process.env.MONGODB_URI.startsWith('mongodb')) {
        logger.error('❌ Invalid MONGODB_URI format');
        process.exit(1);
    }

    if (!process.env.MONGODB_MEDIA_URI.startsWith('mongodb')) {
        logger.error('❌ Invalid MONGODB_MEDIA_URI format');
        process.exit(1);
    }

    logger.info('✅ Environment variables validated successfully');
};

module.exports = { validateEnv };
