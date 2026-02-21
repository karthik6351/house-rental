'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/lib/urlUtils';
import { Search, MapPin, Home, DollarSign, Bed, Bath, Maximize2, Map, SlidersHorizontal, Heart, Star, X, ChevronDown } from 'lucide-react';
import MapModal from '@/components/MapModal';
import FavoriteButton from '@/components/FavoriteButton';
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
    location: { coordinates: [number, number]; };
    owner: { _id: string; name: string; email: string; phone: string; };
    averageRating: number;
    totalReviews: number;
}

function TenantSearchContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({});
    const [filters, setFilters] = useState({
        minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '',
        minArea: '', maxArea: '', furnishing: '', propertyType: '',
        amenities: [] as string[], petFriendly: false, availableFrom: '', radius: '10'
    });

    const fetchProperties = async (useLocation = false) => {
        setIsLoading(true);
        try {
            let params: any = {};
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;
            if (filters.furnishing) params.furnishing = filters.furnishing;
            if (filters.minArea) params.minArea = filters.minArea;
            if (filters.maxArea) params.maxArea = filters.maxArea;
            if (filters.propertyType) params.propertyType = filters.propertyType;
            if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
            if (filters.petFriendly) params.petFriendly = 'true';
            if (filters.availableFrom) params.availableFrom = filters.availableFrom;
            if (filters.radius && userLocation) params.radius = filters.radius;
            if (useLocation && userLocation) { params.lat = userLocation.lat; params.lng = userLocation.lng; }
            const response = await propertyAPI.searchProperties(params);
            setProperties(response.data.properties);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchProperties(); }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => fetchProperties();

    const handleReset = () => {
        setFilters({ minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '', minArea: '', maxArea: '', furnishing: '', propertyType: '', amenities: [], petFriendly: false, availableFrom: '', radius: '10' });
        setUserLocation(null);
        setShowAdvancedFilters(false);
        fetchProperties();
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); fetchProperties(true); },
                () => { alert('Enable location services to use this feature.'); }
            );
        }
    };

    const activeFiltersCount = [filters.maxPrice, filters.bedrooms, filters.propertyType, filters.furnishing, ...filters.amenities].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
            {/* Search Header */}
            <div className="bg-white dark:bg-[#131316] border-b border-gray-100 dark:border-gray-800/50 pt-6 pb-5 px-4 sm:px-6 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Explore <span className="gradient-text">Properties</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Find your perfect match from verified listings</p>
                        </div>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="btn-ghost flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl"
                        >
                            {showMap ? <><Home className="w-4 h-4" /> List</> : <><Map className="w-4 h-4" /> Map</>}
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col lg:flex-row gap-2">
                        <div className="grid grid-cols-2 lg:flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price (₹)" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm text-gray-900 dark:text-white" />
                            </div>
                            <div className="relative flex-1">
                                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm text-gray-900 dark:text-white appearance-none">
                                    <option value="">Beds</option>
                                    <option value="1">1 Bed</option>
                                    <option value="2">2 Beds</option>
                                    <option value="3">3 Beds</option>
                                    <option value="4">4+ Beds</option>
                                </select>
                            </div>
                            <div className="relative flex-1 hidden sm:block">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none text-sm text-gray-900 dark:text-white appearance-none">
                                    <option value="">Type</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="studio">Studio</option>
                                    <option value="penthouse">Penthouse</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`relative px-3 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${showAdvancedFilters ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/15 dark:border-primary-800 dark:text-primary-300' : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-[#0f0f12] dark:border-gray-800 dark:text-gray-300'}`}>
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFiltersCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
                            </button>
                            <button onClick={handleSearch} className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm">
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showAdvancedFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Furnishing</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['any', 'fully-furnished', 'semi-furnished', 'unfurnished'].map(type => (
                                                <button key={type} onClick={() => setFilters({ ...filters, furnishing: type === 'any' ? '' : type })} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${(filters.furnishing === type || (filters.furnishing === '' && type === 'any')) ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900' : 'bg-white border-gray-200 text-gray-600 dark:bg-[#1a1a1f] dark:border-gray-800 dark:text-gray-400'}`}>
                                                    {type === 'any' ? 'Any' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Amenities</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[{ v: 'wifi', l: 'WiFi' }, { v: 'parking', l: 'Parking' }, { v: 'gym', l: 'Gym' }, { v: 'pool', l: 'Pool' }, { v: 'security', l: 'Security' }].map(a => (
                                                <button key={a.v} onClick={() => { const n = filters.amenities.includes(a.v) ? filters.amenities.filter(x => x !== a.v) : [...filters.amenities, a.v]; setFilters({ ...filters, amenities: n }); }} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${filters.amenities.includes(a.v) ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-[#1a1a1f] dark:border-gray-800 dark:text-gray-400'}`}>
                                                    {a.l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 lg:col-span-2">
                                        <button onClick={handleUseMyLocation} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5">
                                            <MapPin size={14} /> Near Me
                                        </button>
                                        <button onClick={handleReset} className="px-3 py-2 bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30">
                                            Reset All
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Map View */}
                <AnimatePresence>
                    {showMap && properties.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 rounded-3xl overflow-hidden shadow-soft border border-gray-200 dark:border-gray-800 h-[350px] lg:h-[400px]">
                            <PropertyMap properties={properties} center={userLocation || undefined} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="mb-5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isLoading ? 'Searching...' : `${properties.length} Properties`}
                    </h2>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card p-0">
                                <div className="skeleton h-56 rounded-t-3xl rounded-b-none" />
                                <div className="p-5 space-y-3">
                                    <div className="skeleton h-5 w-3/4" />
                                    <div className="skeleton h-4 w-1/2" />
                                    <div className="flex gap-3">
                                        <div className="skeleton h-4 w-16" />
                                        <div className="skeleton h-4 w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20 card">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No properties found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">Try adjusting your filters or searching in a different area.</p>
                        <button onClick={handleReset} className="btn-primary text-sm">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {properties.map((property) => (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={property._id}
                                className="card p-0 group"
                            >
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer" onClick={() => router.push(`/property/${property._id}`)}>
                                    {property.images[0] ? (
                                        <img src={getImageUrl(property.images[activeImageIndex[property._id] || 0])} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Home className="w-14 h-14 text-gray-300 dark:text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                    {/* Price */}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-white/95 dark:bg-black/80 backdrop-blur-sm text-gray-900 dark:text-white px-3.5 py-1.5 rounded-xl text-base font-bold shadow-md">
                                            ₹{property.price.toLocaleString()}<span className="text-xs font-medium text-gray-400">/mo</span>
                                        </span>
                                    </div>

                                    {/* Favorite */}
                                    <div className="absolute top-3 right-3">
                                        <FavoriteButton propertyId={property._id} />
                                    </div>

                                    {/* Image dots (if multiple images) */}
                                    {property.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 flex gap-1">
                                            {property.images.slice(0, 4).map((_, i) => (
                                                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => ({ ...prev, [property._id]: i })); }} className={`gallery-dot ${(activeImageIndex[property._id] || 0) === i ? 'active' : ''}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-5">
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600 transition-colors" onClick={() => router.push(`/property/${property._id}`)}>
                                            {property.title}
                                        </h3>
                                        {property.totalReviews > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg shrink-0">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                {property.averageRating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-400 dark:text-gray-500 text-xs mb-3.5 truncate flex items-center gap-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {property.address}
                                    </p>

                                    {/* Features */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        <span className="tag py-1 px-2 text-[11px]"><Bed className="w-3.5 h-3.5" /> {property.bedrooms} Bed</span>
                                        <span className="tag py-1 px-2 text-[11px]"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} Bath</span>
                                        {property.area > 0 && <span className="tag py-1 px-2 text-[11px]"><Maximize2 className="w-3.5 h-3.5" /> {property.area} sqft</span>}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 dark:border-gray-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                {property.owner.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{property.owner.name}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); window.location.href = `/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`; }}
                                            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold rounded-xl transition-colors"
                                        >
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {selectedProperty && (
                    <MapModal isOpen={isMapModalOpen} onClose={() => { setIsMapModalOpen(false); setSelectedProperty(null); }} property={selectedProperty} />
                )}
            </main>
        </div>
    );
}

export default function TenantSearch() {
    return <ProtectedRoute requiredRole="tenant"><TenantSearchContent /></ProtectedRoute>;
}
