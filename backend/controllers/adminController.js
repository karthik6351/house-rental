const User = require('../models/User');
const Property = require('../models/Property');
const DealReceipt = require('../models/DealReceipt');
const Lead = require('../models/Lead');

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
    try {
        const { role, suspended, page = 1, limit = 20, search } = req.query;

        const query = {};
        if (role) query.role = role;
        if (suspended === 'true') query.suspended = true;
        if (suspended === 'false') query.suspended = { $ne: true };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get role counts
        const roleCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const stats = {
            total: await User.countDocuments(),
            owners: 0,
            tenants: 0,
            admins: 0,
            suspended: await User.countDocuments({ suspended: true })
        };
        roleCounts.forEach(r => {
            if (r._id === 'owner') stats.owners = r.count;
            if (r._id === 'tenant') stats.tenants = r.count;
            if (r._id === 'admin') stats.admins = r.count;
        });

        res.json({
            success: true,
            data: users,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

/**
 * Suspend/Unsuspend a user
 * PATCH /api/admin/users/:id/suspend
 */
const toggleUserSuspension = async (req, res) => {
    try {
        const { id } = req.params;
        const { suspend, reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent suspending admins
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend admin users'
            });
        }

        user.suspended = suspend;
        user.suspendedAt = suspend ? new Date() : null;
        user.suspensionReason = suspend ? reason : null;
        await user.save();

        res.json({
            success: true,
            message: suspend ? 'User suspended' : 'User unsuspended',
            data: user
        });

    } catch (error) {
        console.error('Toggle suspension error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user suspension'
        });
    }
};

/**
 * Get all listings (admin only)
 * GET /api/admin/listings
 */
const getListings = async (req, res) => {
    try {
        const { status, hidden, page = 1, limit = 20, search } = req.query;

        const query = {};
        if (status) query.status = status;
        if (hidden === 'true') query.hidden = true;
        if (hidden === 'false') query.hidden = { $ne: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const properties = await Property.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .setOptions({ includeDeleted: true });

        const total = await Property.countDocuments(query).setOptions({ includeDeleted: true });

        // Get status counts
        const statusCounts = await Property.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const stats = {
            total: await Property.countDocuments().setOptions({ includeDeleted: true }),
            available: 0,
            in_discussion: 0,
            approved: 0,
            rented: 0,
            archived: 0,
            hidden: await Property.countDocuments({ hidden: true }).setOptions({ includeDeleted: true })
        };
        statusCounts.forEach(s => {
            stats[s._id] = s.count;
        });

        res.json({
            success: true,
            data: properties,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch listings'
        });
    }
};

/**
 * Hide/Unhide a listing
 * PATCH /api/admin/listings/:id/visibility
 */
const toggleListingVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { hide, reason } = req.body;

        const property = await Property.findById(id).setOptions({ includeDeleted: true });
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        property.hidden = hide;
        property.hiddenAt = hide ? new Date() : null;
        property.hiddenReason = hide ? reason : null;
        await property.save();

        res.json({
            success: true,
            message: hide ? 'Listing hidden' : 'Listing visible',
            data: property
        });

    } catch (error) {
        console.error('Toggle visibility error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update listing visibility'
        });
    }
};

/**
 * Get all receipts (admin only)
 * GET /api/admin/receipts
 */
const getAllReceipts = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const receipts = await DealReceipt.find(query)
            .populate('owner', 'name email')
            .populate('tenant', 'name email')
            .populate('property', 'title address')
            .sort({ confirmedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await DealReceipt.countDocuments(query);

        // Get status counts
        const stats = {
            total: await DealReceipt.countDocuments(),
            confirmed: await DealReceipt.countDocuments({ status: 'confirmed' }),
            cancelled: await DealReceipt.countDocuments({ status: 'cancelled' }),
            completed: await DealReceipt.countDocuments({ status: 'completed' })
        };

        res.json({
            success: true,
            data: receipts,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get all receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipts'
        });
    }
};

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res) => {
    try {
        const [userStats, propertyStats, dealStats] = await Promise.all([
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Property.aggregate([
                { $match: { deleted: false } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            DealReceipt.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, totalRent: { $sum: '$agreedRent' } } }
            ])
        ]);

        const users = { total: 0, owners: 0, tenants: 0, admins: 0 };
        userStats.forEach(u => {
            users.total += u.count;
            if (u._id === 'owner') users.owners = u.count;
            if (u._id === 'tenant') users.tenants = u.count;
            if (u._id === 'admin') users.admins = u.count;
        });

        const properties = { total: 0, available: 0, rented: 0 };
        propertyStats.forEach(p => {
            properties.total += p.count;
            if (p._id === 'available' || p._id === 'in_discussion' || p._id === 'approved') {
                properties.available += p.count;
            }
            if (p._id === 'rented') properties.rented = p.count;
        });

        const deals = { total: 0, confirmed: 0, cancelled: 0, totalRentValue: 0 };
        dealStats.forEach(d => {
            deals.total += d.count;
            if (d._id === 'confirmed') {
                deals.confirmed = d.count;
                deals.totalRentValue = d.totalRent;
            }
            if (d._id === 'cancelled') deals.cancelled = d.count;
        });

        res.json({
            success: true,
            data: {
                users,
                properties,
                deals
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
};

module.exports = {
    getUsers,
    toggleUserSuspension,
    getListings,
    toggleListingVisibility,
    getAllReceipts,
    getDashboardStats
};
