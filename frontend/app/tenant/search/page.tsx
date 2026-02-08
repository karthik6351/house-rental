'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/lib/urlUtils';
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });

interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    address: string;
    furnishing: string;
    images: string[];
    location: {
        coordinates: [number, number];
    };
    owner: {
        _id: string;
        name: string;
        phone: string;
    };
}

function TenantSearchContent() {
    const { user, logout } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        furnishing: '',
        radius: '10',
    });

    const fetchProperties = async (useLocation = false) => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;
            if (filters.furnishing) params.furnishing = filters.furnishing;

            // Add location-based search
            if (useLocation && userLocation) {
                params.lat = userLocation.lat;
                params.lng = userLocation.lng;
                params.radius = filters.radius;
            }

            const response = await propertyAPI.search(params);
            setProperties(response.data.properties);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        fetchProperties();
    };

    const handleReset = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
            furnishing: '',
            radius: '10',
        });
        setUserLocation(null);
        setTimeout(fetchProperties, 100);
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    fetchProperties(true);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Easy Rent" className="h-10 w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-600 dark:text-gray-400 hidden sm:block">Welcome, {user?.name}</p>
                        <button onClick={logout} className="btn-outline text-sm">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="card mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Search Filters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Min Price (₹)
                            </label>
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                className="input-field text-sm"
                                placeholder="10000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Price (₹)
                            </label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="input-field text-sm"
                                placeholder="50000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bedrooms
                            </label>
                            <select
                                name="bedrooms"
                                value={filters.bedrooms}
                                onChange={handleFilterChange}
                                className="input-field text-sm"
                            >
                                <option value="">Any</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bathrooms
                            </label>
                            <select
                                name="bathrooms"
                                value={filters.bathrooms}
                                onChange={handleFilterChange}
                                className="input-field text-sm"
                            >
                                <option value="">Any</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Furnishing
                            </label>
                            <select
                                name="furnishing"
                                value={filters.furnishing}
                                onChange={handleFilterChange}
                                className="input-field text-sm"
                            >
                                <option value="">Any</option>
                                <option value="furnished">Furnished</option>
                                <option value="semi-furnished">Semi-furnished</option>
                                <option value="unfurnished">Unfurnished</option>
                            </select>
                        </div>

                        {userLocation && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Radius (km)
                                </label>
                                <select
                                    name="radius"
                                    value={filters.radius}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                >
                                    <option value="5">5 km</option>
                                    <option value="10">10 km</option>
                                    <option value="20">20 km</option>
                                    <option value="50">50 km</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6 flex-wrap">
                        <button onClick={handleSearch} className="btn-primary">
                            Search Properties
                        </button>
                        <button onClick={handleUseMyLocation} className="btn-outline">
                            📍 Search Near Me
                        </button>
                        <button onClick={handleReset} className="btn-outline">
                            Reset Filters
                        </button>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="btn-outline ml-auto"
                        >
                            {showMap ? '📋 List View' : '🗺️ Map View'}
                        </button>
                    </div>
                </div>

                {/* Map View */}
                {showMap && properties.length > 0 && (
                    <div className="mb-8">
                        <PropertyMap
                            properties={properties}
                            center={userLocation || undefined}
                        />
                    </div>
                )}

                {/* Results */}
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? 'Searching...' : `${properties.length} Properties Found`}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">No properties found. Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property._id} className="card hover:shadow-2xl transition-all cursor-pointer group">
                                <div className="relative h-56 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                                    {property.images[0] ? (
                                        <img
                                            src={getImageUrl(property.images[0])}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            ₹{property.price.toLocaleString()}/mo
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                                    {property.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                    {property.description}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                                    📍 {property.address}
                                </p>

                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        {property.bedrooms} BD
                                    </span>
                                    <span className="flex items-center gap-1">
                                        🚿 {property.bathrooms} BA
                                    </span>
                                    <span className="flex items-center gap-1">
                                        📏 {property.area} sqft
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm">
                                        <p className="text-gray-500 dark:text-gray-400">Owner</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{property.owner.name}</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`}
                                        className="btn-primary text-sm py-2"
                                    >
                                        Contact Owner
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div >
    );
}

export default function TenantSearch() {
    return (
        <ProtectedRoute requiredRole="tenant">
            <TenantSearchContent />
        </ProtectedRoute>
    );
}
