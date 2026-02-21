'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { favoriteAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/urlUtils';
import FavoriteButton from '@/components/FavoriteButton';
import { MapPin, Bed, Bath, Maximize2, Heart, ArrowLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteProperty {
    _id: string; // Favorite ID
    property: {
        _id: string;
        title: string;
        price: number;
        address: string;
        images: string[];
        bedrooms: number;
        bathrooms: number;
        area: number;
        furnishing: string;
        location: {
            coordinates: [number, number];
        };
    };
}

function FavoritesContent() {
    const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await favoriteAPI.getMyFavorites();
            setFavorites(response.data.favorites);
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = (propertyId: string) => {
        setFavorites(prev => prev.filter(fav => fav.property._id !== propertyId));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-20">
            {/* Minimal Header */}
            <div className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md sticky top-[72px] z-30 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-[#1C1C1F] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                                Saved Properties
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Properties you have shortlisted for your next home.</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-[#1C1C1F] rounded-3xl h-96 border border-gray-100 dark:border-gray-800/60 overflow-hidden">
                                <div className="h-56 bg-gray-200 dark:bg-gray-800"></div>
                                <div className="p-5 space-y-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1C1C1F] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 py-20 px-6 text-center shadow-sm"
                    >
                        <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-red-400 dark:text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No saved properties</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg hover:text-gray-600 transition-colors">
                            You haven't added any properties to your favorites yet. Start exploring and save the ones you love!
                        </p>
                        <button
                            onClick={() => router.push('/tenant/search')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                        >
                            <Search className="w-5 h-5" />
                            Browse Properties
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {favorites.map((fav) => (
                                <motion.div
                                    key={fav._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="group bg-white dark:bg-[#1C1C1F] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800/60"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-64 cursor-pointer overflow-hidden" onClick={() => router.push(`/property/${fav.property._id}`)}>
                                        <img
                                            src={getImageUrl(fav.property.images[0])}
                                            alt={fav.property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                                        {/* Status / Type tags */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                For Rent
                                            </span>
                                        </div>

                                        {/* Favorite Button */}
                                        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="bg-white dark:bg-black/50 p-1 rounded-full backdrop-blur-md shadow-sm border border-gray-200 dark:border-gray-700">
                                                <FavoriteButton
                                                    propertyId={fav.property._id}
                                                    initialIsFavorite={true}
                                                    onToggle={(isFav) => !isFav && handleRemove(fav.property._id)}
                                                    className="" // Ensure custom styles are not conflicting if any
                                                />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="absolute bottom-4 left-4">
                                            <div className="bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-gray-900 dark:text-white shadow-lg">
                                                ₹{fav.property.price.toLocaleString()} <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/mo</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 cursor-pointer" onClick={() => router.push(`/property/${fav.property._id}`)}>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {fav.property.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 truncate flex items-center gap-1">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            {fav.property.address}
                                        </p>

                                        {/* Key Features */}
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/80 pt-4">
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#121214] px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
                                                <Bed className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{fav.property.bedrooms} <span className="text-gray-400 font-normal">Bd</span></span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#121214] px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
                                                <Bath className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{fav.property.bathrooms} <span className="text-gray-400 font-normal">Ba</span></span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#121214] px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
                                                <Maximize2 className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{fav.property.area} <span className="text-gray-400 text-xs font-normal">sqft</span></span>
                                            </div>
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
    return (
        <ProtectedRoute requiredRole="tenant">
            <FavoritesContent />
        </ProtectedRoute>
    );
}
