// Types for Industry-Level Platform Features

// Property Status Types
export type PropertyStatus = 'available' | 'in_discussion' | 'approved' | 'rented' | 'archived';

// Property with new fields
export interface Property {
    _id: string;
    owner: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    title: string;
    description: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    furnishing: 'fully-furnished' | 'semi-furnished' | 'unfurnished';
    status: PropertyStatus;
    available: boolean;
    confirmedTenant?: string;
    rentedAt?: string;
    archivedAt?: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    images: string[];
    views: number;
    createdAt: string;
    updatedAt: string;
    deleted?: boolean;
    hidden?: boolean;
}

// Deal Receipt Types
export interface DealReceipt {
    _id: string;
    receiptId: string;
    property: Property;
    owner: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    tenant: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    propertySnapshot: {
        title: string;
        address: string;
        description?: string;
        bedrooms?: number;
        bathrooms?: number;
        area?: number;
        furnishing?: string;
    };
    agreedRent: number;
    securityDeposit: number;
    leaseStartDate?: string;
    leaseDuration: number;
    status: 'confirmed' | 'cancelled' | 'completed';
    confirmedAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
    notes?: string;
    terms?: Array<{ key: string; value: string }>;
    formattedDate: string;
}

// Notification Types
export type NotificationType = 'message' | 'approval' | 'rejection' | 'deal_confirmed' | 'enquiry' | 'status_change' | 'system';
export type NotificationCategory = 'chat' | 'property' | 'deal' | 'system';

export interface Notification {
    _id: string;
    user: string;
    type: NotificationType;
    title: string;
    body?: string;
    relatedProperty?: {
        _id: string;
        title: string;
        images?: string[];
    };
    relatedUser?: {
        _id: string;
        name: string;
    };
    relatedReceipt?: string;
    actionUrl?: string;
    read: boolean;
    readAt?: string;
    category: NotificationCategory;
    createdAt: string;
}

// Lead Types for Owner CRM
export type LeadLabel = 'hot' | 'warm' | 'cold' | 'lost' | 'converted';
export type LeadStage = 'enquiry' | 'viewing_scheduled' | 'viewing_done' | 'negotiating' | 'approved' | 'confirmed' | 'rejected';

export interface LeadNote {
    _id: string;
    text: string;
    createdAt: string;
}

export interface Lead {
    _id: string;
    owner: string;
    tenant: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    property: {
        _id: string;
        title: string;
        address: string;
        price: number;
        images?: string[];
    };
    label: LeadLabel;
    stage: LeadStage;
    notes: LeadNote[];
    lastContactAt: string;
    totalMessages: number;
    tenantBudget?: number;
    preferredMoveInDate?: string;
    convertedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    daysSinceContact?: number;
    createdAt: string;
    updatedAt: string;
}

// Owner Analytics
export interface OwnerAnalytics {
    properties: {
        total: number;
        active: number;
        rented: number;
        archived: number;
        byStatus: Record<PropertyStatus, number>;
    };
    engagement: {
        totalViews: number;
        avgViewsPerProperty: string;
    };
    leads: {
        total: number;
        hot: number;
        warm: number;
        cold: number;
        lost: number;
        converted: number;
        conversionRate: string;
    };
}

// API Response Types
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface NotificationsResponse extends PaginatedResponse<Notification> {
    unreadCount: number;
}

export interface LeadsResponse extends PaginatedResponse<Lead> {
    stats: Record<LeadLabel, number>;
}

// Deal Confirmation Request
export interface ConfirmDealRequest {
    propertyId: string;
    tenantId: string;
    agreedRent: number;
    securityDeposit?: number;
    leaseStartDate?: string;
    leaseDuration?: number;
    notes?: string;
    terms?: Array<{ key: string; value: string }>;
}

// Property Status Update Request
export interface UpdatePropertyStatusRequest {
    status: PropertyStatus;
}

// Lead Update Request
export interface UpdateLeadRequest {
    label?: LeadLabel;
    stage?: LeadStage;
    tenantBudget?: number;
    preferredMoveInDate?: string;
    rejectionReason?: string;
}

// User with new fields
export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'owner' | 'tenant' | 'admin';
    suspended?: boolean;
    suspendedAt?: string;
    suspensionReason?: string;
    createdAt: string;
}

// Admin Dashboard Stats
export interface AdminDashboardStats {
    users: {
        total: number;
        owners: number;
        tenants: number;
        admins: number;
    };
    properties: {
        total: number;
        available: number;
        rented: number;
    };
    deals: {
        total: number;
        confirmed: number;
        cancelled: number;
        totalRentValue: number;
    };
}
