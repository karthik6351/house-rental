import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
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
