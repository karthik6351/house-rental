import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://house-rental-p61v.onrender.com/api';

// Create axios instance with timeout
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {},
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic and error handling
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
            return Promise.reject(error);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait a moment and try again.');
            return Promise.reject(error);
        }

        // Handle network errors with user-friendly messages
        if (error.code === 'ECONNABORTED') {
            toast.error('Request timed out. Please check your connection and try again.');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Please check your internet connection.');
        } else if (error.response) {
            // Server responded with error
            const message = (error.response.data as any)?.message || 'An error occurred';
            toast.error(message);
        } else {
            toast.error('An unexpected error occurred');
        }

        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const propertyAPI = {
    create: (formData: FormData) => api.post('/properties', formData),
    getMyProperties: () => api.get('/properties/my-properties'),
    update: (id: string, formData: FormData) => api.put(`/properties/${id}`, formData),
    delete: (id: string) => api.delete(`/properties/${id}`),
    toggleAvailability: (id: string) => api.patch(`/properties/${id}/availability`),
    search: (params: any) => api.get('/properties/search', { params }),
    getById: (id: string) => api.get(`/properties/${id}`),
    getReverseGeocode: (lat: number, lng: number) => api.get('/properties/reverse-geocode', { params: { lat, lng } }),
};

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (propertyId: string, otherUserId: string) =>
        api.get(`/chat/messages/${propertyId}/${otherUserId}`),
    sendMessage: (data: any) => api.post('/chat/messages', data),
};

