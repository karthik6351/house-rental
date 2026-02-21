'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/lib/urlUtils';
import { Search, MapPin, Home, DollarSign, Bed, Bath, Maximize2, Map, ChevronDown, ChevronRight, SlidersHorizontal, Heart, Star } from 'lucide-react';
import MapModal from '@/components/MapModal';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20">
            {/* Search Hero Section */}
            <div className="bg-white dark:bg-[#121214] border-b border-gray-200 dark:border-gray-800 pt-8 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Explore <span className="text-primary-600 dark:text-primary-400">Properties</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Find your perfect match from our premium listings</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                {showMap ? (
                                    <><Home className="w-5 h-5" /> List View</>
                                ) : (
                                    <><Map className="w-5 h-5" /> Map View</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-gray-50 dark:bg-[#0a0a0b] p-2 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row gap-2">
                        <div className="grid grid-cols-2 lg:flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Location (Not implemented)"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                    disabled
                                />
                            </div>
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Max Price (₹)"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="bedrooms"
                                    value={filters.bedrooms}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="">Any Beds</option>
                                    <option value="1">1 Bed</option>
                                    <option value="2">2 Beds</option>
                                    <option value="3">3 Beds</option>
                                    <option value="4">4+ Beds</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="propertyType"
                                    value={filters.propertyType}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="">Any Type</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-colors ${showAdvancedFilters
                                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                                    : 'bg-white border-gray-200 text-gray-700 dark:bg-[#1C1C1F] dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span className="hidden lg:inline">Filters</span>
                            </button>
                            <button
                                onClick={handleSearch}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors flex-1 lg:flex-none shadow-lg shadow-primary-500/25"
                            >
                                <Search className="w-5 h-5" />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    <AnimatePresence>
                        {showAdvancedFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Furnishing</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['any', 'furnished', 'semi-furnished', 'unfurnished'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFilters({ ...filters, furnishing: type === 'any' ? '' : type })}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${(filters.furnishing === type || (filters.furnishing === '' && type === 'any'))
                                                        ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-[#1C1C1F] dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                >
                                                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: 'wifi', label: 'WiFi' },
                                                { value: 'parking', label: 'Parking' },
                                                { value: 'gym', label: 'Gym' },
                                                { value: 'pool', label: 'Pool' },
                                            ].map((amenity) => (
                                                <button
                                                    key={amenity.value}
                                                    onClick={() => {
                                                        const newAmenities = filters.amenities.includes(amenity.value)
                                                            ? filters.amenities.filter(a => a !== amenity.value)
                                                            : [...filters.amenities, amenity.value];
                                                        setFilters({ ...filters, amenities: newAmenities });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filters.amenities.includes(amenity.value)
                                                        ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-[#1C1C1F] dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                >
                                                    {amenity.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-2 pb-1 lg:col-span-2">
                                        <button onClick={handleUseMyLocation} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
                                            <MapPin size={16} /> Near Me
                                        </button>
                                        <button onClick={handleReset} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40">
                                            Reset All
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Map View */}
                <AnimatePresence>
                    {showMap && properties.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 h-[400px]"
                        >
                            <PropertyMap
                                properties={properties}
                                center={userLocation || undefined}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? 'Searching...' : `${properties.length} Properties found`}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-[#1C1C1F] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
                                <div className="flex gap-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-3xl">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No properties matched</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your filters or searching in a different area to find what you're looking for.</p>
                        <button onClick={handleReset} className="mt-6 btn-primary">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((property) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={property._id}
                                className="group relative bg-white dark:bg-[#1C1C1F] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800/60"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer" onClick={() => router.push(`/tenant/property/${property._id}`)}>
                                    {property.images[0] ? (
                                        <img
                                            src={getImageUrl(property.images[0])}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Home className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                    {/* Price Tag */}
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-white/95 dark:bg-black/80 backdrop-blur-sm text-gray-900 dark:text-white px-4 py-1.5 rounded-full text-lg font-bold shadow-lg">
                                            ₹{property.price.toLocaleString()}<span className="text-sm font-medium text-gray-500 dark:text-gray-400">/mo</span>
                                        </span>
                                    </div>

                                    {/* Favorite Button */}
                                    <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content Container */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => router.push(`/tenant/property/${property._id}`)}>
                                            {property.title}
                                        </h3>
                                        {property.totalReviews > 0 && (
                                            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                {property.averageRating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 truncate flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                        {property.address}
                                    </p>

                                    {/* Features */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-5">
                                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <Bed className="w-4 h-4 text-gray-400" />
                                            {property.bedrooms} Bed
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <Bath className="w-4 h-4 text-gray-400" />
                                            {property.bathrooms} Bath
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <Maximize2 className="w-4 h-4 text-gray-400" />
                                            {property.area} sqft
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/80">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                                                {property.owner.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{property.owner.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`;
                                                }}
                                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors shadow-sm"
                                            >
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
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
        </div>
    );
}

export default function TenantSearch() {
    return (
        <ProtectedRoute requiredRole="tenant">
            <TenantSearchContent />
        </ProtectedRoute>
    );
}
