'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { favoriteAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/urlUtils';
import FavoriteButton from '@/components/FavoriteButton';
import { MapPin, Bed, Bath, Maximize2, Heart, Search, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteProperty {
    _id: string;
    property: {
        _id: string; title: string; price: number; address: string; images: string[];
        bedrooms: number; bathrooms: number; area: number; furnishing: string;
        location: { coordinates: [number, number] };
    };
}

function FavoritesContent() {
    const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { fetchFavorites(); }, []);

    const fetchFavorites = async () => {
        try {
            const response = await favoriteAPI.getMyFavorites();
            setFavorites(response.data.favorites);
        } catch (error) { console.error('Failed to fetch favorites', error); }
        finally { setIsLoading(false); }
    };

    const handleRemove = (propertyId: string) => {
        setFavorites(prev => prev.filter(fav => fav.property._id !== propertyId));
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
            <div className="bg-white dark:bg-[#131316] border-b border-gray-100 dark:border-gray-800/50 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Heart size={22} className="text-red-500 fill-red-500" /> Saved Properties
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your shortlisted properties</p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card p-0">
                                <div className="skeleton h-56 rounded-t-3xl rounded-b-none" />
                                <div className="p-5 space-y-3">
                                    <div className="skeleton h-5 w-3/4" />
                                    <div className="skeleton h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card text-center py-20 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none hover:shadow-none hover:translate-y-0"
                    >
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved properties</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">Start exploring and save the properties you love!</p>
                        <button onClick={() => router.push('/tenant/search')} className="btn-primary text-sm flex items-center gap-2 mx-auto">
                            <Search size={16} /> Browse Properties
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {favorites.map((fav) => (
                                <motion.div
                                    key={fav._id}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card p-0 group"
                                >
                                    <div className="relative h-56 cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800" onClick={() => router.push(`/property/${fav.property._id}`)}>
                                        {fav.property.images[0] ? (
                                            <img src={getImageUrl(fav.property.images[0])} alt={fav.property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-gray-300" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                                            <FavoriteButton propertyId={fav.property._id} />
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <span className="bg-white/95 dark:bg-black/80 backdrop-blur-sm px-3.5 py-1.5 rounded-xl font-bold text-gray-900 dark:text-white shadow-md">
                                                ₹{fav.property.price.toLocaleString()}<span className="text-xs text-gray-400 font-medium">/mo</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 cursor-pointer" onClick={() => router.push(`/property/${fav.property._id}`)}>
                                        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate group-hover:text-primary-600 transition-colors">{fav.property.title}</h3>
                                        <p className="text-gray-400 text-xs mb-3 truncate flex items-center gap-1"><MapPin size={12} /> {fav.property.address}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="tag py-1 px-2 text-[11px]"><Bed className="w-3.5 h-3.5" /> {fav.property.bedrooms}</span>
                                            <span className="tag py-1 px-2 text-[11px]"><Bath className="w-3.5 h-3.5" /> {fav.property.bathrooms}</span>
                                            {fav.property.area > 0 && <span className="tag py-1 px-2 text-[11px]"><Maximize2 className="w-3.5 h-3.5" /> {fav.property.area}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function FavoritesPage() {
    return <ProtectedRoute requiredRole="tenant"><FavoritesContent /></ProtectedRoute>;
}
