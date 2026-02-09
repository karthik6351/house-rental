import api from './api';
import {
    DealReceipt,
    Notification,
    NotificationsResponse,
    Lead,
    LeadsResponse,
    OwnerAnalytics,
    ConfirmDealRequest,
    UpdatePropertyStatusRequest,
    UpdateLeadRequest,
    PaginatedResponse,
    PropertyStatus
} from '@/types/industry';

// ============ DEAL & RECEIPT SERVICES ============

export const dealService = {
    // Confirm a deal between owner and tenant
    confirmDeal: async (data: ConfirmDealRequest) => {
        const response = await api.post('/deals/confirm', data);
        return response.data;
    },

    // Get all receipts for the current user
    getReceipts: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get<PaginatedResponse<DealReceipt>>('/deals/receipts', { params });
        return response.data;
    },

    // Get single receipt by ID
    getReceiptById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: DealReceipt }>(`/deals/receipts/${id}`);
        return response.data;
    },

    // Cancel a deal
    cancelDeal: async (id: string, reason?: string) => {
        const response = await api.patch(`/deals/receipts/${id}/cancel`, { reason });
        return response.data;
    },

    // Update property status
    updatePropertyStatus: async (propertyId: string, status: PropertyStatus) => {
        const response = await api.patch(`/deals/properties/${propertyId}/status`, { status });
        return response.data;
    }
};

// ============ NOTIFICATION SERVICES ============

export const notificationService = {
    // Get all notifications
    getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
        const response = await api.get<NotificationsResponse>('/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get<{ success: boolean; data: { count: number } }>('/notifications/count');
        return response.data;
    },

    // Mark single notification as read
    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id: string) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};

// ============ LEAD/CRM SERVICES ============

export const leadService = {
    // Get all leads for owner
    getLeads: async (params?: { label?: string; stage?: string; propertyId?: string; page?: number; limit?: number }) => {
        const response = await api.get<LeadsResponse>('/leads', { params });
        return response.data;
    },

    // Get owner analytics
    getAnalytics: async () => {
        const response = await api.get<{ success: boolean; data: OwnerAnalytics }>('/leads/analytics');
        return response.data;
    },

    // Get single lead
    getLeadById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: Lead }>(`/leads/${id}`);
        return response.data;
    },

    // Update lead
    updateLead: async (id: string, data: UpdateLeadRequest) => {
        const response = await api.patch(`/leads/${id}`, data);
        return response.data;
    },

    // Add note to lead
    addNote: async (id: string, text: string) => {
        const response = await api.post(`/leads/${id}/notes`, { text });
        return response.data;
    }
};

// ============ ADMIN SERVICES ============

export const adminService = {
    // Get dashboard stats
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get all users
    getUsers: async (params?: { role?: string; suspended?: string; page?: number; limit?: number; search?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    // Suspend/unsuspend user
    toggleUserSuspension: async (id: string, suspend: boolean, reason?: string) => {
        const response = await api.patch(`/admin/users/${id}/suspend`, { suspend, reason });
        return response.data;
    },

    // Get all listings
    getListings: async (params?: { status?: string; hidden?: string; page?: number; limit?: number; search?: string }) => {
        const response = await api.get('/admin/listings', { params });
        return response.data;
    },

    // Hide/unhide listing
    toggleListingVisibility: async (id: string, hide: boolean, reason?: string) => {
        const response = await api.patch(`/admin/listings/${id}/visibility`, { hide, reason });
        return response.data;
    },

    // Get all receipts
    getReceipts: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/admin/receipts', { params });
        return response.data;
    }
};
