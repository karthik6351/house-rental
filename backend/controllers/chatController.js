const Message = require('../models/Message');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get all conversations for user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole === 'owner') {
            // For owner: Get all properties and their conversations
            const properties = await Property.find({ owner: userId });
            const propertyIds = properties.map(p => p._id);

            // Get unique tenants per property
            const conversations = await Message.aggregate([
                {
                    $match: {
                        property: { $in: propertyIds }
                    }
                },
                {
                    $group: {
                        _id: {
                            property: '$property',
                            tenant: {
                                $cond: [
                                    { $eq: ['$sender', userId] },
                                    '$receiver',
                                    '$sender'
                                ]
                            }
                        },
                        lastMessage: { $last: '$content' },
                        lastMessageTime: { $last: '$createdAt' },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: { lastMessageTime: -1 }
                }
            ]);

            // Populate property and tenant details
            const populatedConversations = await Promise.all(
                conversations.map(async (conv) => {
                    const property = await Property.findById(conv._id.property);
                    const tenant = await User.findById(conv._id.tenant).select('name email');
                    return {
                        property,
                        tenant,
                        lastMessage: conv.lastMessage,
                        lastMessageTime: conv.lastMessageTime,
                        unreadCount: conv.unreadCount
                    };
                })
            );

            res.status(200).json({
                success: true,
                conversations: populatedConversations
            });

        } else {
            // For tenant: Get all properties they've messaged about
            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [{ sender: userId }, { receiver: userId }]
                    }
                },
                {
                    $group: {
                        _id: '$property',
                        lastMessage: { $last: '$content' },
                        lastMessageTime: { $last: '$createdAt' },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: { lastMessageTime: -1 }
                }
            ]);

            // Populate property and owner details
            const populatedConversations = await Promise.all(
                conversations.map(async (conv) => {
                    const property = await Property.findById(conv._id).populate('owner', 'name email');
                    return {
                        property,
                        lastMessage: conv.lastMessage,
                        lastMessageTime: conv.lastMessageTime,
                        unreadCount: conv.unreadCount
                    };
                })
            );

            res.status(200).json({
                success: true,
                conversations: populatedConversations
            });
        }

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/messages/:propertyId/:otherUserId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { propertyId, otherUserId } = req.params;
        const userId = req.user._id;

        // Verify access to this conversation
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check if user is authorized to view this conversation
        const isOwner = property.owner.toString() === userId;
        const isParticipant = isOwner || otherUserId === userId;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this conversation'
            });
        }

        // Fetch messages
        const messages = await Message.find({
            property: propertyId,
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name')
            .populate('receiver', 'name');

        // Mark messages as read
        await Message.updateMany(
            {
                property: propertyId,
                receiver: userId,
                sender: otherUserId,
                read: false
            },
            { read: true }
        );

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { propertyId, receiverId, content } = req.body;
        const senderId = req.user._id;
        const senderRole = req.user.role;

        // Validate input
        if (!propertyId || !receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Property ID, receiver ID, and content are required'
            });
        }

        // Verify property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // ============ PROPERTY STATUS VALIDATION ============
        // Cannot message on archived properties
        if (property.status === 'archived') {
            return res.status(403).json({
                success: false,
                message: 'Cannot send messages for archived properties'
            });
        }

        // Cannot message on rented properties (unless you are the confirmed tenant or owner)
        if (property.status === 'rented') {
            const isOwner = property.owner.toString() === senderId.toString();
            const isConfirmedTenant = property.confirmedTenant &&
                property.confirmedTenant.toString() === senderId.toString();

            if (!isOwner && !isConfirmedTenant) {
                return res.status(403).json({
                    success: false,
                    message: 'This property has been rented. Messaging is disabled.'
                });
            }
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // ============ AUTO-CREATE LEAD ============
        // If a tenant is messaging an owner about a property, auto-create/update lead
        if (senderRole === 'tenant' && property.owner.toString() === receiverId.toString()) {
            const Lead = require('../models/Lead');
            await Lead.findOneAndUpdate(
                { owner: receiverId, tenant: senderId, property: propertyId },
                {
                    $setOnInsert: {
                        owner: receiverId,
                        tenant: senderId,
                        property: propertyId,
                        stage: 'enquiry',
                        label: 'warm'
                    },
                    lastContactAt: new Date(),
                    $inc: { totalMessages: 1 }
                },
                { upsert: true, new: true }
            );
        }

        // Create message
        const message = await Message.create({
            property: propertyId,
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        await message.populate('sender', 'name');
        await message.populate('receiver', 'name');

        // ============ CREATE NOTIFICATION ============
        const Notification = require('../models/Notification');
        await Notification.createNotification({
            userId: receiverId,
            type: 'message',
            title: 'New Message',
            body: `${req.user.name} sent you a message about "${property.title}"`,
            relatedProperty: propertyId,
            relatedUser: senderId,
            actionUrl: `/messages/${propertyId}/${senderId}`,
            category: 'chat'
        });

        res.status(201).json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Send message error:', error);

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
            message: 'Failed to send message',
            error: error.message
        });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage
};
