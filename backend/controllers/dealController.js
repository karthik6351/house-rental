const DealReceipt = require('../models/DealReceipt');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');

// Valid status transitions
const VALID_TRANSITIONS = {
    'available': ['in_discussion', 'archived'],
    'in_discussion': ['approved', 'available', 'archived'],
    'approved': ['rented', 'in_discussion', 'archived'],
    'rented': [], // Terminal state - no further transitions
    'archived': ['available'] // Can be reactivated
};

/**
 * Confirm a deal between owner and tenant
 * POST /api/deals/confirm
 */
const confirmDeal = async (req, res) => {
    try {
        const { propertyId, tenantId, agreedRent, securityDeposit, leaseStartDate, leaseDuration, notes, terms } = req.body;
        const ownerId = req.user._id;

        // Validation
        if (!propertyId || !tenantId || !agreedRent) {
            return res.status(400).json({
                success: false,
                message: 'Property ID, Tenant ID, and Agreed Rent are required'
            });
        }

        // Get property and verify ownership
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        if (property.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the property owner can confirm deals'
            });
        }

        // Check property status - must be 'approved' to confirm deal
        if (property.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: `Cannot confirm deal. Property status must be 'approved'. Current status: '${property.status}'`
            });
        }

        // Check if property is already rented
        if (property.confirmedTenant) {
            return res.status(400).json({
                success: false,
                message: 'This property already has a confirmed tenant'
            });
        }

        // Check for duplicate receipt
        const existingReceipt = await DealReceipt.findOne({
            property: propertyId,
            status: 'confirmed'
        });
        if (existingReceipt) {
            return res.status(400).json({
                success: false,
                message: 'A confirmed deal already exists for this property'
            });
        }

        // Create property snapshot
        const propertySnapshot = {
            title: property.title,
            address: property.address,
            description: property.description,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            furnishing: property.furnishing
        };

        // Create deal receipt
        const receipt = new DealReceipt({
            property: propertyId,
            owner: ownerId,
            tenant: tenantId,
            propertySnapshot,
            agreedRent,
            securityDeposit: securityDeposit || 0,
            leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : null,
            leaseDuration: leaseDuration || 12,
            notes,
            terms: terms || []
        });

        await receipt.save();

        // Update property status
        property.status = 'rented';
        property.confirmedTenant = tenantId;
        property.rentedAt = new Date();
        property.available = false;
        await property.save();

        // Update lead stage to confirmed
        await Lead.findOneAndUpdate(
            { owner: ownerId, tenant: tenantId, property: propertyId },
            { stage: 'confirmed', label: 'converted', convertedAt: new Date() }
        );

        // Create notifications for both parties
        await Promise.all([
            Notification.createNotification({
                userId: tenantId,
                type: 'deal_confirmed',
                title: 'Deal Confirmed! 🎉',
                body: `Your rental for "${property.title}" has been confirmed.`,
                relatedProperty: propertyId,
                relatedReceipt: receipt._id,
                actionUrl: `/receipt/${receipt._id}`,
                category: 'deal'
            }),
            Notification.createNotification({
                userId: ownerId,
                type: 'deal_confirmed',
                title: 'Deal Confirmed! 🎉',
                body: `You have confirmed a tenant for "${property.title}".`,
                relatedProperty: propertyId,
                relatedReceipt: receipt._id,
                actionUrl: `/receipt/${receipt._id}`,
                category: 'deal'
            })
        ]);

        // Populate receipt for response
        await receipt.populate([
            { path: 'owner', select: 'name email phone' },
            { path: 'tenant', select: 'name email phone' },
            { path: 'property', select: 'title address images' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Deal confirmed successfully',
            data: receipt
        });

    } catch (error) {
        console.error('Confirm deal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm deal',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all receipts for the current user (owner or tenant)
 * GET /api/receipts
 */
const getReceipts = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = {
            $or: [{ owner: userId }, { tenant: userId }]
        };

        if (status) {
            query.status = status;
        }

        const receipts = await DealReceipt.find(query)
            .populate('owner', 'name email phone')
            .populate('tenant', 'name email phone')
            .populate('property', 'title address images')
            .sort({ confirmedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await DealReceipt.countDocuments(query);

        res.json({
            success: true,
            data: receipts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipts'
        });
    }
};

/**
 * Get single receipt by ID
 * GET /api/receipts/:id
 */
const getReceiptById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const receipt = await DealReceipt.findById(id)
            .populate('owner', 'name email phone')
            .populate('tenant', 'name email phone')
            .populate('property', 'title address images location');

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Check authorization - only owner, tenant, or admin can view
        const isOwner = receipt.owner._id.toString() === userId.toString();
        const isTenant = receipt.tenant._id.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isTenant && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this receipt'
            });
        }

        res.json({
            success: true,
            data: receipt
        });

    } catch (error) {
        console.error('Get receipt by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipt'
        });
    }
};

/**
 * Cancel a deal (only by owner, within certain conditions)
 * PATCH /api/receipts/:id/cancel
 */
const cancelDeal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { reason } = req.body;

        const receipt = await DealReceipt.findById(id);
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Only owner or admin can cancel
        if (receipt.owner.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only the property owner or admin can cancel deals'
            });
        }

        if (receipt.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This deal is already cancelled'
            });
        }

        // Update receipt
        receipt.status = 'cancelled';
        receipt.cancelledAt = new Date();
        receipt.cancellationReason = reason || 'No reason provided';
        await receipt.save();

        // Revert property status to available
        await Property.findByIdAndUpdate(receipt.property, {
            status: 'available',
            confirmedTenant: null,
            rentedAt: null,
            available: true
        });

        // Notify tenant
        await Notification.createNotification({
            userId: receipt.tenant,
            type: 'rejection',
            title: 'Deal Cancelled',
            body: `The deal for your rental has been cancelled. Reason: ${reason || 'Not specified'}`,
            relatedProperty: receipt.property,
            relatedReceipt: receipt._id,
            category: 'deal'
        });

        res.json({
            success: true,
            message: 'Deal cancelled successfully',
            data: receipt
        });

    } catch (error) {
        console.error('Cancel deal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel deal'
        });
    }
};

/**
 * Update property status
 * PATCH /api/properties/:id/status
 */
const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check ownership
        if (property.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the property owner can change status'
            });
        }

        // Validate transition
        const currentStatus = property.status;
        const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

        if (!allowedTransitions.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`
            });
        }

        // Update status
        property.status = status;

        if (status === 'archived') {
            property.archivedAt = new Date();
            property.available = false;
        } else if (status === 'available') {
            property.archivedAt = null;
            property.available = true;
        }

        await property.save();

        res.json({
            success: true,
            message: `Property status updated to '${status}'`,
            data: property
        });

    } catch (error) {
        console.error('Update property status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update property status'
        });
    }
};

module.exports = {
    confirmDeal,
    getReceipts,
    getReceiptById,
    cancelDeal,
    updatePropertyStatus,
    VALID_TRANSITIONS
};
