const mongoose = require('mongoose');

const leadNoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxlength: [500, 'Note cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const leadSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    // CRM Label for quick categorization
    label: {
        type: String,
        enum: ['hot', 'warm', 'cold', 'lost', 'converted'],
        default: 'warm'
    },
    // Sales pipeline stage
    stage: {
        type: String,
        enum: ['enquiry', 'viewing_scheduled', 'viewing_done', 'negotiating', 'approved', 'confirmed', 'rejected'],
        default: 'enquiry'
    },
    // Owner's private notes about this lead
    notes: [leadNoteSchema],
    // Contact tracking
    lastContactAt: {
        type: Date,
        default: Date.now
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    // Tenant's expressed interest level
    tenantBudget: {
        type: Number
    },
    preferredMoveInDate: {
        type: Date
    },
    // Conversion tracking
    convertedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for unique lead per property-tenant combo
leadSchema.index({ owner: 1, tenant: 1, property: 1 }, { unique: true });
leadSchema.index({ owner: 1, label: 1 });
leadSchema.index({ owner: 1, stage: 1 });
leadSchema.index({ owner: 1, createdAt: -1 });

// Static method to find or create lead
leadSchema.statics.findOrCreateLead = async function ({ ownerId, tenantId, propertyId }) {
    let lead = await this.findOne({
        owner: ownerId,
        tenant: tenantId,
        property: propertyId
    });

    if (!lead) {
        lead = await this.create({
            owner: ownerId,
            tenant: tenantId,
            property: propertyId
        });
    }

    return lead;
};

// Instance method to add note
leadSchema.methods.addNote = async function (noteText) {
    this.notes.push({ text: noteText });
    this.lastContactAt = new Date();
    await this.save();
    return this;
};

// Instance method to update stage
leadSchema.methods.updateStage = async function (newStage) {
    this.stage = newStage;

    if (newStage === 'confirmed') {
        this.label = 'converted';
        this.convertedAt = new Date();
    } else if (newStage === 'rejected') {
        this.label = 'lost';
        this.rejectedAt = new Date();
    }

    await this.save();
    return this;
};

// Virtual for days since last contact
leadSchema.virtual('daysSinceContact').get(function () {
    if (!this.lastContactAt) return null;
    const diffTime = Math.abs(new Date() - this.lastContactAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
