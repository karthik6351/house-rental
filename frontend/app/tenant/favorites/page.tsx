'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { favoriteAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/urlUtils';
import FavoriteButton from '@/components/FavoriteButton';

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {favorites.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">❤️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start exploring properties and save the ones you love!
                        </p>
                        <button
                            onClick={() => router.push('/tenant/search')}
                            className="btn-primary"
                        >
                            Browse Properties
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((fav) => (
                            <div key={fav._id} className="card hover:shadow-lg transition-shadow overflow-hidden group">
                                <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                                    <img
                                        src={getImageUrl(fav.property.images[0])}
                                        alt={fav.property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <FavoriteButton
                                            propertyId={fav.property._id}
                                            initialIsFavorite={true}
                                            onToggle={(isFav) => !isFav && handleRemove(fav.property._id)}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                        <p className="text-white font-bold text-lg">₹{fav.property.price.toLocaleString()}/mo</p>
                                    </div>
                                </div>

                                <div onClick={() => router.push(`/property/${fav.property._id}`)} className="cursor-pointer">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                                        {fav.property.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 truncate">
                                        📍 {fav.property.address}
                                    </p>

                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <span>🛏️ {fav.property.bedrooms} Bed</span>
                                        <span>🚿 {fav.property.bathrooms} Bath</span>
                                        <span>📏 {fav.property.area} sqft</span>
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

export default function FavoritesPage() {
    return (
        <ProtectedRoute requiredRole="tenant">
            <FavoritesContent />
        </ProtectedRoute>
    );
}
