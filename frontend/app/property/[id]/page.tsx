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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <ShareButton
                            title={property.title}
                            text={`Check out this property: ${property.title} at ${property.address}`}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name}</span>
                        <button onClick={() => router.push('/')} className="btn-outline text-sm">
                            Home
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Image Gallery */}
                <div className="mb-8">
                    {/* Main Image */}
                    <div className="relative h-96 md:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-4">
                        {property.images.length > 0 ? (
                            <>
                                <img
                                    src={getImageUrl(property.images[selectedImageIndex])}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                                    {selectedImageIndex + 1} / {property.images.length}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {property.images.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {property.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative h-20 rounded-lg overflow-hidden transition-all ${selectedImageIndex === index
                                        ? 'ring-4 ring-primary-600 scale-105'
                                        : 'hover:ring-2 ring-gray-300 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`View ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title and Price */}
                        <div className="card">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {property.title}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {property.address}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <p className="text-4xl font-bold text-primary-600">
                                    ₹{property.price.toLocaleString()}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">per month</p>
                                {user?.role === 'tenant' && (
                                    <FavoriteButton propertyId={property._id} className="mt-2" />
                                )}
                            </div>
                        </div>

                        {/* Property Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg inline-flex mb-2">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Bedrooms</p>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{property.bedrooms}</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg inline-flex mb-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Bathrooms</p>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{property.bathrooms}</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg inline-flex mb-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Area</p>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{property.area} sqft</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg inline-flex mb-2">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Furnishing</p>
                                <p className="font-bold text-sm text-gray-900 dark:text-white capitalize">{property.furnishing}</p>
                            </div>
                        </div>

                        {/* Availability Status */}
                        <div className="mt-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${property.available
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${property.available ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                {property.available ? 'Available for Rent' : 'Currently Unavailable'}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                            {property.description}
                        </p>
                    </div>

                    {/* Location Map */}
                    <div className="card">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
                        <div className="h-96 rounded-lg overflow-hidden">
                            <PropertyMap properties={[property]} center={{ lat: property.location.coordinates[1], lng: property.location.coordinates[0] }} />
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <ReviewSection
                        propertyId={property._id}
                        averageRating={property.averageRating}
                        totalReviews={property.totalReviews}
                    />
                </div>

                {/* Sidebar - Owner Info */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Property Owner</h2>

                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 p-6 rounded-lg mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {property.owner.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{property.owner.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Property Owner</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm">{property.owner.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-sm">{property.owner.phone}</span>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'tenant' && property.available && (
                            <button
                                onClick={handleContactOwner}
                                className="w-full btn-primary py-3 text-lg font-semibold hover:shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Contact Owner
                            </button>
                        )}

                        {!property.available && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                                <p className="text-red-800 dark:text-red-200 font-semibold">This property is currently unavailable</p>
                            </div>
                        )}
                    </div>
                </div>
        </div>
            </main >
        </div >
    );
}

export default function PropertyDetail() {
    return (
        <ProtectedRoute>
            <PropertyDetailContent />
        </ProtectedRoute>
    );
}
