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
import { motion } from 'framer-motion';
import { Plus, Home, Eye, TrendingUp, Edit3, EyeOff, Trash2, MessageCircle, Users, MoreVertical, Building2 } from 'lucide-react';

interface Property {
    _id: string; title: string; price: number; bedrooms: number; bathrooms: number;
    address: string; images: string[]; available: boolean; status: PropertyStatus;
    createdAt: string; views: number;
}

function DashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchProperties(); }, []);

    const fetchProperties = async () => {
        try {
            const response = await propertyAPI.getMyProperties();
            setProperties(response.data.properties);
        } catch (error) { console.error('Failed to fetch properties:', error); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;
        try { await propertyAPI.delete(id); setProperties(properties.filter(p => p._id !== id)); }
        catch (error) { alert('Failed to delete property'); }
    };

    const toggleAvailability = async (id: string) => {
        try {
            const property = properties.find(p => p._id === id);
            if (!property) return;
            await propertyAPI.toggleAvailability(id, !property.available);
            setProperties(properties.map(p => p._id === id ? { ...p, available: !p.available } : p));
        } catch (error) { alert('Failed to update availability'); }
    };

    const totalViews = properties.reduce((t, p) => t + (p.views || 0), 0);
    const activeCount = properties.filter(p => p.available).length;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
            {/* Header */}
            <div className="bg-white dark:bg-[#131316] border-b border-gray-100 dark:border-gray-800/50 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                            <NotificationBell className="text-gray-600 dark:text-gray-300" />
                            <button onClick={() => router.push('/owner/leads')} className="btn-ghost text-xs border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-1.5 whitespace-nowrap">
                                <Users size={14} /> Leads
                            </button>
                            <button onClick={() => router.push('/owner/messages')} className="btn-ghost text-xs border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-1.5 whitespace-nowrap">
                                <MessageCircle size={14} /> Messages
                            </button>
                            <button onClick={() => router.push('/owner/properties/new')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap">
                                <Plus size={14} /> Add Property
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
                    {[
                        { label: 'Total Properties', value: properties.length, icon: Building2, color: 'primary', gradient: 'from-primary-500/10 to-primary-600/5' },
                        { label: 'Active Listings', value: activeCount, icon: TrendingUp, color: 'emerald', gradient: 'from-emerald-500/10 to-emerald-600/5' },
                        { label: 'Total Views', value: totalViews, icon: Eye, color: 'amber', gradient: 'from-amber-500/10 to-amber-600/5' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card p-4 sm:p-5 lg:p-6 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl -mr-8 -mt-8`} />
                            <div className="relative z-10">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-3`}>
                                    <stat.icon size={18} className={`text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">{stat.value}</h3>
                                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Properties Section */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Properties</h2>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card p-0">
                                <div className="skeleton h-44 rounded-t-3xl rounded-b-none" />
                                <div className="p-5 space-y-3">
                                    <div className="skeleton h-5 w-3/4" />
                                    <div className="skeleton h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="card text-center py-16 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none hover:shadow-none hover:translate-y-0">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Home className="w-7 h-7 text-primary-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No properties yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">List your first property and start receiving leads from verified tenants.</p>
                        <button onClick={() => router.push('/owner/properties/new')} className="btn-primary text-sm">
                            <Plus size={16} className="inline mr-1.5" /> List Property
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {properties.map((property, i) => (
                            <motion.div
                                key={property._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="card p-0 group flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer rounded-t-3xl" onClick={() => router.push(`/property/${property._id}`)}>
                                    {property.images[0] ? (
                                        <img src={getImageUrl(property.images[0])} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-gray-300 dark:text-gray-700" /></div>
                                    )}
                                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                                        <PropertyStatusBadge status={property.status || 'available'} />
                                        <span className={`badge text-[10px] ${property.available ? 'badge-success' : 'badge-neutral'}`}>
                                            {property.available ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-3 badge badge-neutral backdrop-blur-md border-0 bg-black/50 text-white">
                                        <Eye size={12} /> {property.views || 0}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate">{property.title}</h3>
                                    <p className="text-gray-400 text-xs mb-3 truncate flex items-center gap-1">
                                        <MapPin size={12} className="shrink-0" /> {property.address}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto mb-4">
                                        <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">₹{property.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-2.5 text-xs font-medium text-gray-500">
                                            <span>{property.bedrooms} Bed</span>
                                            <span>{property.bathrooms} Bath</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-3 gap-1.5 pt-3.5 border-t border-gray-100 dark:border-gray-800/50">
                                        <button onClick={() => router.push(`/owner/properties/${property._id}/edit`)} className="btn-ghost text-xs py-2 flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-800 rounded-xl">
                                            <Edit3 size={13} /> Edit
                                        </button>
                                        <button onClick={() => toggleAvailability(property._id)} className="btn-ghost text-xs py-2 flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-800 rounded-xl">
                                            {property.available ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                                        </button>
                                        <button onClick={() => handleDelete(property._id)} className="btn-ghost text-xs py-2 flex items-center justify-center gap-1 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Import MapPin here since it's used in the property card
import { MapPin } from 'lucide-react';

export default function OwnerDashboard() {
    return <ProtectedRoute requiredRole="owner"><DashboardContent /></ProtectedRoute>;
}
