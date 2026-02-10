'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/lib/urlUtils';
import { Search, MapPin, Home, DollarSign, Bed, Bath, Maximize2, Map, ChevronDown, ChevronRight } from 'lucide-react';
import MapModal from '@/components/MapModal';
import NotificationBell from '@/components/NotificationBell';
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
        email: string;
        phone: string;
    };
    averageRating: number;
    totalReviews: number;
}

function TenantSearchContent() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        minArea: '',
        maxArea: '',
        furnishing: '',
        propertyType: '',
        amenities: [] as string[],
        petFriendly: false,
        availableFrom: '',
        radius: '10'
    });

    const fetchProperties = async (useLocation = false) => {
        setIsLoading(true);
        try {
            setIsLoading(true);
            let params: any = {};

            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;
            if (filters.furnishing) params.furnishing = filters.furnishing;
            if (filters.minArea) params.minArea = filters.minArea;
            if (filters.maxArea) params.maxArea = filters.maxArea;

            // Advanced filters
            if (filters.propertyType) params.propertyType = filters.propertyType;
            if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
            if (filters.petFriendly) params.petFriendly = 'true';
            if (filters.availableFrom) params.availableFrom = filters.availableFrom;
            if (filters.radius && userLocation) params.radius = filters.radius;

            if (useLocation && userLocation) {
                params.lat = userLocation.lat;
                params.lng = userLocation.lng;
            }

            const response = await propertyAPI.searchProperties(params);
            setProperties(response.data.properties);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            alert('Failed to load properties');
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
            minArea: '',
            maxArea: '',
            furnishing: '',
            propertyType: '',
            amenities: [],
            petFriendly: false,
            availableFrom: '',
            radius: '10'
        });
        setUserLocation(null);
        setShowAdvancedFilters(false);
        fetchProperties();
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
                        <NotificationBell className="text-gray-700 dark:text-gray-300" />
                        <button
                            onClick={() => router.push('/tenant/messages')}
                            className="btn-outline text-sm"
                        >
                            Messages
                        </button>
                        <button
                            onClick={() => router.push('/tenant/favorites')}
                            className="btn-outline text-sm"
                        >
                            ❤️ Favorites
                        </button>
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
                    </div>

                    {/* Advanced Filters Toggle */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                            {showAdvancedFilters ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            <span>Advanced Filters</span>
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Property Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Property Type
                                    </label>
                                    <select
                                        name="propertyType"
                                        value={filters.propertyType}
                                        onChange={handleFilterChange}
                                        className="input-field text-sm"
                                    >
                                        <option value="">Any</option>
                                        <option value="apartment">🏢 Apartment</option>
                                        <option value="house">🏠 House</option>
                                        <option value="condo">🏘️ Condo</option>
                                        <option value="studio">🎨 Studio</option>
                                        <option value="villa">🏰 Villa</option>
                                        <option value="penthouse">🌃 Penthouse</option>
                                    </select>
                                </div>

                                {/* Pet Friendly */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Pet Friendly
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                                        <input
                                            type="checkbox"
                                            name="petFriendly"
                                            checked={filters.petFriendly}
                                            onChange={(e) => setFilters({ ...filters, petFriendly: e.target.checked })}
                                            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">🐕 Pets Allowed</span>
                                    </label>
                                </div>

                                {/* Move-in Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📅 Move-in Date
                                    </label>
                                    <input
                                        type="date"
                                        name="availableFrom"
                                        value={filters.availableFrom}
                                        onChange={handleFilterChange}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>

                            {/* Amenities Multi-Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Amenities
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {[
                                        { value: 'wifi', label: 'WiFi', icon: '📶' },
                                        { value: 'parking', label: 'Parking', icon: '🅿️' },
                                        { value: 'gym', label: 'Gym', icon: '💪' },
                                        { value: 'pool', label: 'Pool', icon: '🏊' },
                                        { value: 'security', label: 'Security', icon: '🔒' },
                                        { value: '247_water', label: '24/7 Water', icon: '💧' },
                                        { value: 'power_backup', label: 'Power Backup', icon: '⚡' },
                                        { value: 'elevator', label: 'Elevator', icon: '🛗' },
                                        { value: 'garden', label: 'Garden', icon: '🌳' },
                                        { value: 'playground', label: 'Playground', icon: '🎮' },
                                        { value: 'clubhouse', label: 'Clubhouse', icon: '🏛️' },
                                        { value: 'cctv', label: 'CCTV', icon: '📹' }
                                    ].map((amenity) => (
                                        <label
                                            key={amenity.value}
                                            className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${filters.amenities.includes(amenity.value)
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.amenities.includes(amenity.value)}
                                                onChange={(e) => {
                                                    const newAmenities = e.target.checked
                                                        ? [...filters.amenities, amenity.value]
                                                        : filters.amenities.filter(a => a !== amenity.value);
                                                    setFilters({ ...filters, amenities: newAmenities });
                                                }}
                                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="text-2xl">{amenity.icon}</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {amenity.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Distance Filter */}
                            {userLocation && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📍 Distance (within {filters.radius} km)
                                    </label>
                                    <input
                                        type="range"
                                        name="radius"
                                        min="1"
                                        max="50"
                                        value={filters.radius}
                                        onChange={handleFilterChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>1 km</span>
                                        <span className="font-bold text-primary-600 dark:text-primary-400">{filters.radius} km</span>
                                        <span>50 km</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                            <div
                                key={property._id}
                                className="card hover:shadow-2xl transition-all cursor-pointer group"
                                onClick={() => router.push(`/property/${property._id}`)}
                            >
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
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                                    {property.description}
                                </p>

                                {/* Rating Display */}
                                {property.totalReviews > 0 && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.round(property.averageRating)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                    />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {property.averageRating.toFixed(1)} ({property.totalReviews} {property.totalReviews === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                )}

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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProperty(property);
                                                setIsMapModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 transition-colors"
                                            title="View on Map"
                                        >
                                            <Map className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`;
                                            }}
                                            className="btn-primary text-sm py-2 hover:shadow-lg transition-shadow"
                                        >
                                            Contact Owner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Map Modal */}
                {selectedProperty && (
                    <MapModal
                        isOpen={isMapModalOpen}
                        onClose={() => {
                            setIsMapModalOpen(false);
                            setSelectedProperty(null);
                        }}
                        property={selectedProperty}
                    />
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
