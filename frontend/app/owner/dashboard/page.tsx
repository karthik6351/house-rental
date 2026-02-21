'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/urlUtils';
import NotificationBell from '@/components/NotificationBell';
import { PropertyStatusBadge } from '@/components/PropertyStatusManager';
import { PropertyStatus } from '@/types/industry';

interface Property {
    _id: string;
    title: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    address: string;
    images: string[];
    available: boolean;
    status: PropertyStatus;
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-20">
            {/* Dashboard Sub-header */}
            <div className="bg-white dark:bg-[#121214] border-b border-gray-200 dark:border-gray-800 sticky top-[72px] z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Owner Dashboard</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your properties, leads, and messages.</p>
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <NotificationBell className="text-gray-700 dark:text-gray-300 mr-2" />
                            <button
                                onClick={() => router.push('/owner/leads')}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Leads
                            </button>
                            <button
                                onClick={() => router.push('/owner/messages')}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Messages
                            </button>
                            <button
                                onClick={() => router.push('/owner/properties/new')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap shadow-md shadow-primary-500/20"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Property
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-[#1C1C1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary-500/20"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Properties</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{properties.length}</h3>
                            </div>
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1C1C1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-green-500/20"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Active Listings</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{properties.filter(p => p.available).length}</h3>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1C1C1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-orange-500/20"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Views</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                    {properties.reduce((total, p) => total + (p.views || 0), 0)}
                                </h3>
                            </div>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Properties</h2>
                </div>

                {/* Properties List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-[#1C1C1F] rounded-2xl h-80 border border-gray-100 dark:border-gray-800/60">
                                <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-t-2xl"></div>
                                <div className="p-5 space-y-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C1F] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 py-16 px-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No properties here</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">It looks like you haven't listed any properties yet. Add one to start earning!</p>
                        <button
                            onClick={() => router.push('/owner/properties/new')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                        >
                            List Your First Property
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property._id} className="bg-white dark:bg-[#1C1C1F] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer" onClick={() => router.push(`/property/${property._id}`)}>
                                    {property.images[0] ? (
                                        <img
                                            src={getImageUrl(property.images[0])}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                        <PropertyStatusBadge status={property.status || 'available'} />
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md backdrop-blur-md shadow-sm border ${property.available ? 'bg-green-500/90 text-white border-green-400/20' : 'bg-gray-800/90 text-gray-300 border-gray-700'}`}>
                                            {property.available ? 'Available' : 'Hidden'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-3">
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-md shadow-sm">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {property.views || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate" title={property.title}>{property.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 truncate flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {property.address}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto mb-5">
                                        <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
                                            ₹{property.price.toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> {property.bedrooms}</span>
                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {property.bathrooms}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800/80 pt-4">
                                        <button
                                            onClick={() => router.push(`/owner/properties/${property._id}/edit`)}
                                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleAvailability(property._id)}
                                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center justify-center border border-gray-200 dark:border-gray-700 whitespace-nowrap"
                                        >
                                            {property.available ? 'Hide' : 'Show'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(property._id)}
                                            className="col-span-2 lg:col-span-1 px-3 py-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1.5 border border-red-100 dark:border-red-900/30"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            <span className="lg:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function OwnerDashboard() {
    return (
        <ProtectedRoute requiredRole="owner">
            <DashboardContent />
        </ProtectedRoute>
    );
}
