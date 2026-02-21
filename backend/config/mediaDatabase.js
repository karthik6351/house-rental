const mongoose = require('mongoose');
const logger = require('./logger');

let mediaConnection = null;

const connectMediaDB = async () => {
    if (mediaConnection && mediaConnection.readyState === 1) {
        logger.info('Using existing MongoDB Media connection');
        return mediaConnection;
    }

    try {
        const mediaUri = process.env.MONGODB_MEDIA_URI;
        if (!mediaUri) {
            throw new Error('MONGODB_MEDIA_URI is not defined');
        }

        mediaConnection = await mongoose.createConnection(mediaUri).asPromise();

        logger.info(`✅ MongoDB Media Connected: ${mediaConnection.host}`);

        mediaConnection.on('error', (err) => {
            logger.error('❌ MongoDB Media connection error:', err);
        });

        mediaConnection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB Media disconnected');
        });

        return mediaConnection;
    } catch (error) {
        logger.error('❌ Error connecting to MongoDB Media:', error.message);
        throw error;
    }
};

const getMediaConnection = () => mediaConnection;

module.exports = { connectMediaDB, getMediaConnection };
