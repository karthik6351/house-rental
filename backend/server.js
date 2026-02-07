require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connect to database
connectDB();

// Middleware - CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://easyrent1.vercel.app'
];

// Add FRONTEND_URL from env if it exists
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
            console.log('✅ CORS: Allowing request with no origin');
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            console.log('✅ CORS: Allowing origin:', origin);
            callback(null, true);
        } else {
            console.log('⚠️ CORS: Blocked origin:', origin);
            console.log('   Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Image serving route (GridFS)
const mongoose = require('mongoose');

// Create a separate connection for media
const mediaUri = process.env.MONGODB_MEDIA_URI || process.env.MONGODB_URI;

// Check if we have a valid URI before connecting
if (!mediaUri) {
    console.error('❌ Missing MongoDB URI for media storage');
}

const mediaConn = mongoose.createConnection(mediaUri);
let gfsBucket;

mediaConn.on('connected', () => {
    console.log('✅ MongoDB Media Connected');
});

mediaConn.on('error', (err) => {
    console.error('❌ MongoDB Media Connection Error:', err);
});

mediaConn.once('open', () => {
    gfsBucket = new mongoose.mongo.GridFSBucket(mediaConn.db, {
        bucketName: 'properties'
    });
});

app.get('/uploads/properties/:filename', async (req, res) => {
    try {
        console.log('📸 Image Request:', req.params.filename);

        if (!gfsBucket) {
            console.error('❌ GridFS bucket not initialized');
            return res.status(500).json({ message: 'Media database not connected' });
        }

        const file = await gfsBucket.find({ filename: req.params.filename }).toArray();

        if (!file || file.length === 0) {
            console.error('❌ File not found in GridFS:', req.params.filename);
            return res.status(404).json({ message: 'File not found' });
        }

        console.log('✅ File found in GridFS:', req.params.filename, 'Type:', file[0].contentType);

        // Set content-type
        if (file[0].contentType) {
            res.set('Content-Type', file[0].contentType);
        } else {
            // Default to image/jpeg if no content type
            res.set('Content-Type', 'image/jpeg');
        }

        // Set cache headers for better performance
        res.set('Cache-Control', 'public, max-age=31536000');

        const readStream = gfsBucket.openDownloadStreamByName(req.params.filename);

        readStream.on('error', (error) => {
            console.error('❌ Stream error:', error);
            if (!res.headersSent) {
                res.status(404).json({ message: 'Error streaming image' });
            }
        });

        readStream.pipe(res);

    } catch (error) {
        console.error('❌ Image streaming error:', error);
        if (!res.headersSent) {
            res.status(404).json({ message: 'Image not found' });
        }
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.IO for real-time chat
const Message = require('./models/Message');

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Join specific conversation room
    socket.on('join-conversation', ({ propertyId, userId }) => {
        const room = `property-${propertyId}`;
        socket.join(room);
        console.log(`User ${userId} joined conversation room: ${room}`);
    });

    // Handle sending message
    socket.on('send-message', async (data) => {
        try {
            const { propertyId, senderId, receiverId, content } = data;

            // Save message to database
            const message = await Message.create({
                property: propertyId,
                sender: senderId,
                receiver: receiverId,
                content: content.trim()
            });

            await message.populate('sender', 'name');
            await message.populate('receiver', 'name');

            // Emit to conversation room
            const room = `property-${propertyId}`;
            io.to(room).emit('new-message', message);

            // Also emit to receiver's personal room for notifications
            io.to(receiverId).emit('notification', {
                type: 'new-message',
                message: message
            });

        } catch (error) {
            console.error('Socket send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle typing indicator
    socket.on('typing', ({ propertyId, userId, isTyping }) => {
        const room = `property-${propertyId}`;
        socket.to(room).emit('user-typing', { userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    if (server.listening) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

module.exports = app;
