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

// Middleware
// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://easyrent1.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Image serving route (GridFS)
const mongoose = require('mongoose');

// Create a separate connection for media
const mediaConn = mongoose.createConnection(process.env.MONGODB_MEDIA_URI);
let gfsBucket;

mediaConn.once('open', () => {
    console.log('✅ MongoDB Media Connected');
    gfsBucket = new mongoose.mongo.GridFSBucket(mediaConn.db, {
        bucketName: 'properties'
    });
});

app.get('/uploads/properties/:filename', async (req, res) => {
    try {
        if (!gfsBucket) {
            return res.status(500).json({ message: 'Media database not connected' });
        }

        const _id = req.params.id;
        const file = await gfsBucket.find({ filename: req.params.filename }).toArray();

        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if content-type is available
        if (file[0].contentType) {
            res.set('Content-Type', file[0].contentType);
        }

        const readStream = gfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.pipe(res);

    } catch (error) {
        console.error('Image streaming error:', error);
        res.status(404).json({ message: 'Image not found' });
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
