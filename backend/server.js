require('dotenv').config();

// Validate environment variables before starting
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { connectMediaDB } = require('./config/mediaDatabase');
const { initGridFS } = require('./middleware/uploadGridFS');
const logger = require('./config/logger');
const { apiLimiter } = require('./config/rateLimiter');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Trust proxy for Render deployment (behind reverse proxy)
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connect to databases
const initDatabases = async () => {
    await connectDB();
    const mediaConn = await connectMediaDB();
    initGridFS(mediaConn);
};
initDatabases();

// Manual CORS headers - FIRST middleware, failsafe to ensure CORS headers are always present
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = [
        'http://localhost:3000',
        'https://easyrent1.vercel.app'
    ];
    if (process.env.FRONTEND_URL) {
        allowed.push(process.env.FRONTEND_URL);
    }
    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range,X-Content-Range');
        res.setHeader('Access-Control-Max-Age', '86400');
    }
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: { write: message => logger.http(message.trim()) }
    }));
}

// CORS Configuration - MUST come before helmet and rate limiting
const allowedOrigins = [
    'http://localhost:3000',
    'https://easyrent1.vercel.app'
];

// Add FRONTEND_URL from env if it exists
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

logger.info('🔒 CORS Allowed Origins: ' + allowedOrigins.join(', '));

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`⚠️ CORS: Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions));

// Apply CORS middleware
app.use(cors(corsOptions));

// Security Middleware - Helmet for security headers (AFTER CORS)
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to avoid breaking maps/images
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded
}));

// Rate limiting - Apply AFTER CORS
app.use('/api/', apiLimiter);

// Body parser middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());


// Image serving route (Disk Storage)
const uploadPath = process.env.UPLOAD_PATH || './uploads/properties';

// Serve static files with CORS headers
app.use('/uploads/properties', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
}, express.static(uploadPath));

app.get('/uploads/properties/:filename', (req, res) => {
    const filePath = path.join(__dirname, uploadPath, req.params.filename);
    logger.debug('📸 Image Request:', req.params.filename);

    if (fs.existsSync(filePath)) {
        logger.debug('✅ File found:', req.params.filename);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.sendFile(filePath);
    } else {
        logger.error('❌ File not found:', req.params.filename);
        res.status(404).json({ message: 'File not found' });
    }
});


// Attach Socket.io to req object for use in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const chatRoutes = require('./routes/chat');
const imageRoutes = require('./routes/images');
const reviewRoutes = require('./routes/reviews');
const favoritesRoutes = require('./routes/favorites');
const dealRoutes = require('./routes/deals');
const notificationRoutes = require('./routes/notifications');
const leadRoutes = require('./routes/leads');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);

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
    logger.info('✅ User connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId) => {
        socket.join(userId);
        logger.debug(`User ${userId} joined their room`);
    });

    // Join specific conversation room
    socket.on('join-conversation', ({ propertyId, userId }) => {
        const room = `property-${propertyId}`;
        socket.join(room);
        logger.debug(`User ${userId} joined conversation room: ${room}`);
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
            logger.error('Socket send message error:', error);
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
        logger.info('❌ User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Ignore favicon.ico requests to prevent 404 errors in the browser
app.get('/favicon.ico', (req, res) => res.status(204).end());

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
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('❌ Unhandled Rejection:', err);
    if (server.listening) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

module.exports = app;
