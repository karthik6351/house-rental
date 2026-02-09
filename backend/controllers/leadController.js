const Lead = require('../models/Lead');
const Property = require('../models/Property');

/**
 * Get all leads for the current owner
 * GET /api/leads
 */
const getLeads = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { label, stage, propertyId, page = 1, limit = 20 } = req.query;

        // Verify user is an owner
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only owners can view leads'
            });
        }

        const query = { owner: ownerId };
        if (label) query.label = label;
        if (stage) query.stage = stage;
        if (propertyId) query.property = propertyId;

        const leads = await Lead.find(query)
            .populate('tenant', 'name email phone')
            .populate('property', 'title address images price')
            .sort({ lastContactAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(query);

        // Get summary stats
        const stats = await Lead.aggregate([
            { $match: { owner: ownerId } },
            {
                $group: {
                    _id: '$label',
                    count: { $sum: 1 }
                }
            }
        ]);

        const labelCounts = {
            hot: 0,
            warm: 0,
            cold: 0,
            lost: 0,
            converted: 0
        };
        stats.forEach(s => {
            labelCounts[s._id] = s.count;
        });

        res.json({
            success: true,
            data: leads,
            stats: labelCounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads'
        });
    }
};

/**
 * Get single lead by ID
 * GET /api/leads/:id
 */
const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user._id;

        const lead = await Lead.findOne({ _id: id, owner: ownerId })
            .populate('tenant', 'name email phone')
            .populate('property', 'title address images price');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: lead
        });

    } catch (error) {
        console.error('Get lead by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lead'
        });
    }
};

/**
 * Update lead label/stage
 * PATCH /api/leads/:id
 */
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user._id;
        const { label, stage, tenantBudget, preferredMoveInDate, rejectionReason } = req.body;

        const lead = await Lead.findOne({ _id: id, owner: ownerId });
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Update fields if provided
        if (label) lead.label = label;
        if (stage) {
            lead.stage = stage;
            if (stage === 'confirmed') {
                lead.label = 'converted';
                lead.convertedAt = new Date();
            } else if (stage === 'rejected') {
                lead.label = 'lost';
                lead.rejectedAt = new Date();
                lead.rejectionReason = rejectionReason;
            }
        }
        if (tenantBudget !== undefined) lead.tenantBudget = tenantBudget;
        if (preferredMoveInDate) lead.preferredMoveInDate = new Date(preferredMoveInDate);

        await lead.save();

        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: lead
        });

    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lead'
        });
    }
};

/**
 * Add note to lead
 * POST /api/leads/:id/notes
 */
const addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user._id;
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Note text is required'
            });
        }

        const lead = await Lead.findOne({ _id: id, owner: ownerId });
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        await lead.addNote(text.trim());

        res.json({
            success: true,
            message: 'Note added successfully',
            data: lead
        });

    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add note'
        });
    }
};

/**
 * Get owner analytics
 * GET /api/analytics/owner
 */
const getOwnerAnalytics = async (req, res) => {
    try {
        const ownerId = req.user._id;

        // Get property stats
        const propertyStats = await Property.aggregate([
            { $match: { owner: ownerId, deleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        // Get lead conversion stats
        const leadStats = await Lead.aggregate([
            { $match: { owner: ownerId } },
            {
                $group: {
                    _id: null,
                    totalLeads: { $sum: 1 },
                    hotLeads: { $sum: { $cond: [{ $eq: ['$label', 'hot'] }, 1, 0] } },
                    warmLeads: { $sum: { $cond: [{ $eq: ['$label', 'warm'] }, 1, 0] } },
                    coldLeads: { $sum: { $cond: [{ $eq: ['$label', 'cold'] }, 1, 0] } },
                    lostLeads: { $sum: { $cond: [{ $eq: ['$label', 'lost'] }, 1, 0] } },
                    convertedLeads: { $sum: { $cond: [{ $eq: ['$label', 'converted'] }, 1, 0] } }
                }
            }
        ]);

        // Calculate totals
        const statusCounts = {
            available: 0,
            in_discussion: 0,
            approved: 0,
            rented: 0,
            archived: 0
        };
        let totalViews = 0;

        propertyStats.forEach(s => {
            statusCounts[s._id] = s.count;
            totalViews += s.totalViews;
        });

        const totalProperties = Object.values(statusCounts).reduce((a, b) => a + b, 0);
        const activeProperties = statusCounts.available + statusCounts.in_discussion + statusCounts.approved;

        const leads = leadStats[0] || {
            totalLeads: 0,
            hotLeads: 0,
            warmLeads: 0,
            coldLeads: 0,
            lostLeads: 0,
            convertedLeads: 0
        };

        const conversionRate = leads.totalLeads > 0
            ? ((leads.convertedLeads / leads.totalLeads) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                properties: {
                    total: totalProperties,
                    active: activeProperties,
                    rented: statusCounts.rented,
                    archived: statusCounts.archived,
                    byStatus: statusCounts
                },
                engagement: {
                    totalViews,
                    avgViewsPerProperty: totalProperties > 0 ? (totalViews / totalProperties).toFixed(1) : 0
                },
                leads: {
                    total: leads.totalLeads,
                    hot: leads.hotLeads,
                    warm: leads.warmLeads,
                    cold: leads.coldLeads,
                    lost: leads.lostLeads,
                    converted: leads.convertedLeads,
                    conversionRate: `${conversionRate}%`
                }
            }
        });

    } catch (error) {
        console.error('Get owner analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
};

module.exports = {
    getLeads,
    getLeadById,
    updateLead,
    addNote,
    getOwnerAnalytics
};
