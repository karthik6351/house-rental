'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/urlUtils';
import dynamic from 'next/dynamic';
import ReviewSection from '@/components/ReviewSection';
import FavoriteButton from '@/components/FavoriteButton';
import ShareButton from '@/components/ShareButton';
import { MapPin, Bed, Bath, Maximize2, Star, CheckCircle2, ArrowLeft, Phone, Mail, Home, ShieldCheck, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
    available: boolean;
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

function PropertyDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        if (params.id) {
            fetchProperty();
            // Increment view count (basic debounce using session storage)
            const viewKey = `viewed_${params.id}`;
            if (!sessionStorage.getItem(viewKey)) {
                propertyAPI.incrementView(params.id as string)
                    .then(() => sessionStorage.setItem(viewKey, 'true'))
                    .catch(err => console.error('Failed to increment view', err));
            }
        }
    }, [params.id]);

    const fetchProperty = async () => {
        try {
            const response = await propertyAPI.getProperty(params.id as string);
            setProperty(response.data.property);
        } catch (error) {
            console.error('Failed to fetch property:', error);
            alert('Failed to load property details');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactOwner = () => {
        if (property && user?.role === 'tenant') {
            router.push(`/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20">
            {/* Top Navigation Bar - Minimal */}
            <div className="bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <ShareButton
                            title={property.title}
                            text={`Check out this property: ${property.title} at ${property.address}`}
                        />
                        {user?.role === 'tenant' && (
                            <FavoriteButton propertyId={property._id} className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" />
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Information */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${property.available
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${property.available ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                    {property.available ? 'For Rent' : 'Unavailable'}
                                </span>
                                {property.totalReviews > 0 && (
                                    <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        {property.averageRating.toFixed(1)} <span className="text-gray-500 font-normal">({property.totalReviews} reviews)</span>
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                                {property.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-lg">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                {property.address}
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide uppercase">Monthly Rent</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">₹{property.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Image Gallery */}
                <div className="mb-12">
                    {property.images.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm">
                            {/* Main Large Image */}
                            <div className="md:col-span-2 lg:col-span-3 relative h-full group cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                                <img
                                    src={getImageUrl(property.images[0])}
                                    alt={property.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>

                            {/* Side Grid */}
                            <div className="hidden md:flex flex-col gap-4 h-full">
                                {property.images.slice(1, 3).map((image, idx) => (
                                    <div key={idx} className="relative h-1/2 group cursor-pointer overflow-hidden rounded-r-none md:rounded-r-none" onClick={() => setSelectedImageIndex(idx + 1)}>
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${property.title} view ${idx + 2}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        {idx === 1 && property.images.length > 3 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                                                <span className="text-white font-bold text-xl">+{property.images.length - 3} Photos</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {property.images.length === 2 && (
                                    <div className="relative h-1/2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                                    </div>
                                )}
                                {property.images.length === 1 && (
                                    <>
                                        <div className="relative h-1/2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                                            <Home className="w-10 h-10 text-gray-300 dark:text-gray-600 opacity-50" />
                                        </div>
                                        <div className="relative h-1/2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Home className="w-10 h-10 text-gray-300 dark:text-gray-600 opacity-50" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
                            <Home className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}

                    {/* Thumbnail Scroller (Mobile mostly, or for remaining images) */}
                    {property.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 mt-6 scrollbar-hide snap-x">
                            {property.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden snap-center transition-all ${selectedImageIndex === index
                                        ? 'ring-2 ring-primary-600 scale-100'
                                        : 'opacity-60 hover:opacity-100 hover:scale-95'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content (Left Side) */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Highlights/Features Bar */}
                        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Bed className="w-6 h-6 text-gray-400" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{property.bedrooms} Beds</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <Bath className="w-6 h-6 text-gray-400" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{property.bathrooms} Baths</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <Maximize2 className="w-6 h-6 text-gray-400" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{property.area} <span className="text-sm font-normal text-gray-500">sqft</span></p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-gray-400" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white capitalize">{property.furnishing}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this property</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                                {property.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Box */}
                        <div className="bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What this place offers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                {['High-speed WiFi', 'Dedicated Workspace', 'Free Parking', 'Air Conditioning', 'Fully Equipped Kitchen', 'Washing Machine', 'Smart TV', '24/7 Security'].map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Where you'll be</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{property.address}</p>
                            <div className="h-[400px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative z-0">
                                <PropertyMap properties={[property]} center={{ lat: property.location.coordinates[1], lng: property.location.coordinates[0] }} />
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                            <ReviewSection
                                propertyId={property._id}
                                averageRating={property.averageRating}
                                totalReviews={property.totalReviews}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Owner Info & Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            {/* Host Card */}
                            <div className="bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Meet your host</h3>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                        {property.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{property.owner.name}</p>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                            <span>Identity verified</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span>{property.owner.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span>{property.owner.phone}</span>
                                    </div>
                                </div>

                                {user?.role === 'tenant' && property.available ? (
                                    <button
                                        onClick={handleContactOwner}
                                        className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-base font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Message Host
                                    </button>
                                ) : !property.available && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-center font-medium">
                                        Currently Unavailable
                                    </div>
                                )}
                            </div>

                            {/* Safety info or highlights */}
                            <div className="bg-white dark:bg-[#1C1C1F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Safety & Property rules</h3>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-0.5">•</span>
                                        <span>No smoking inside the property</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-0.5">•</span>
                                        <span>Pets allowed (with prior approval)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-0.5">•</span>
                                        <span>Security deposit required</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Report Listing */}
                            <button className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-2 w-full hover:text-gray-900 dark:hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                Report this listing
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function PropertyDetail() {
    return (
        <ProtectedRoute>
            <PropertyDetailContent />
        </ProtectedRoute>
    );
}
