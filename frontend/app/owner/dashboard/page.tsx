'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/urlUtils';

interface Property {
    _id: string;
    title: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    address: string;
    images: string[];
    available: boolean;
    createdAt: string;
    views: number;
}

function DashboardContent() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await propertyAPI.getMyProperties();
            setProperties(response.data.properties);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            await propertyAPI.delete(id);
            setProperties(properties.filter(p => p._id !== id));
        } catch (error) {
            alert('Failed to delete property');
        }
    };

    const toggleAvailability = async (id: string) => {
        try {
            const property = properties.find(p => p._id === id);
            if (!property) return;

            await propertyAPI.toggleAvailability(id, !property.available);
            setProperties(properties.map(p =>
                p._id === id ? { ...p, available: !p.available } : p
            ));
        } catch (error) {
            alert('Failed to update availability');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Easy Rent" className="h-10 w-auto" />
                            <p className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block">Welcome back, {user?.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/owner/messages')}
                                className="btn-outline text-sm"
                            >
                                Messages
                            </button>
                            <button onClick={logout} className="btn-outline text-sm">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Properties</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{properties.length}</p>
                            </div>
                            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Listings</p>
                                <p className="text-3xl font-bold text-success-600 mt-1">
                                    {properties.filter(p => p.available).length}
                                </p>
                            </div>
                            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Unavailable</p>
                                <p className="text-3xl font-bold text-gray-500 mt-1">
                                    {properties.filter(p => !p.available).length}
                                </p>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Property Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/owner/properties/new')}
                        className="btn-primary"
                    >
                        + Add New Property
                    </button>
                </div>

                {/* Properties List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">No properties yet. Add your first property to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property._id} className="card hover:shadow-xl transition-shadow">
                                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                                    {property.images[0] ? (
                                        <img
                                            src={getImageUrl(property.images[0])}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.available
                                            ? 'bg-success-100 text-success-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {property.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <span className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-md">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {property.views || 0}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{property.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{property.address}</p>

                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>₹{property.price.toLocaleString()}/mo</span>
                                    <span>{property.bedrooms} BD</span>
                                    <span>{property.bathrooms} BA</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/owner/properties/${property._id}/edit`)}
                                        className="flex-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toggleAvailability(property._id)}
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        {property.available ? 'Mark Unavailable' : 'Mark Available'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main >
        </div >
    );
}

export default function OwnerDashboard() {
    return (
        <ProtectedRoute requiredRole="owner">
            <DashboardContent />
        </ProtectedRoute>
    );
}
