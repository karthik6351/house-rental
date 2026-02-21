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
import { MapPin, Bed, Bath, Maximize2, Star, CheckCircle2, ArrowLeft, Phone, Mail, Home, ShieldCheck, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });

interface Property {
    _id: string; title: string; description: string; price: number; bedrooms: number;
    bathrooms: number; area: number; address: string; furnishing: string; images: string[];
    available: boolean; location: { coordinates: [number, number] };
    owner: { _id: string; name: string; email: string; phone: string };
    averageRating: number; totalReviews: number;
    amenities?: string[]; propertyType?: string; petFriendly?: boolean;
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
            router.back();
        } finally { setIsLoading(false); }
    };

    const handleContactOwner = () => {
        if (property && user?.role === 'tenant') {
            router.push(`/tenant/messages?propertyId=${property._id}&ownerId=${property.owner._id}`);
        }
    };

    const nextImage = () => {
        if (!property) return;
        setSelectedImageIndex(prev => (prev + 1) % property.images.length);
    };
    const prevImage = () => {
        if (!property) return;
        setSelectedImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <div className="skeleton h-[400px] md:h-[500px] rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="skeleton h-8 w-3/4" />
                            <div className="skeleton h-5 w-1/2" />
                            <div className="skeleton h-40 rounded-2xl" />
                        </div>
                        <div className="skeleton h-64 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Back Button */}
                <button onClick={() => router.back()} className="btn-ghost text-sm flex items-center gap-2 -ml-2 mb-4">
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Image Gallery */}
                <div className="mb-8">
                    {property.images.length > 0 ? (
                        <div className="relative rounded-3xl overflow-hidden shadow-soft">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 h-[320px] md:h-[480px]">
                                <div className="md:col-span-3 relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={getImageUrl(property.images[selectedImageIndex])}
                                        alt={property.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                                    {/* Navigation arrows */}
                                    {property.images.length > 1 && (
                                        <>
                                            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                                                <ChevronRight size={20} />
                                            </button>
                                        </>
                                    )}

                                    {/* Actions */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <ShareButton propertyId={property._id} title={property.title} />
                                        {user?.role === 'tenant' && <FavoriteButton propertyId={property._id} />}
                                    </div>

                                    {/* Counter */}
                                    {property.images.length > 1 && (
                                        <div className="absolute bottom-4 left-4 badge badge-neutral bg-black/50 border-0 backdrop-blur-md text-white text-xs">
                                            {selectedImageIndex + 1} / {property.images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Side thumbnails (desktop) */}
                                <div className="hidden md:flex flex-col gap-1.5">
                                    {property.images.slice(1, 4).map((image, idx) => (
                                        <div key={idx} className="relative flex-1 cursor-pointer overflow-hidden group bg-gray-100 dark:bg-gray-800" onClick={() => setSelectedImageIndex(idx + 1)}>
                                            <img src={getImageUrl(image)} alt={`View ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            {idx === 2 && property.images.length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">+{property.images.length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {property.images.length < 4 && [...Array(Math.max(0, 3 - (property.images.length - 1)))].map((_, i) => (
                                        <div key={`empty-${i}`} className="flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Home className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Thumbnail Scroller */}
                            {property.images.length > 1 && (
                                <div className="flex gap-2 p-3 md:hidden overflow-x-auto scrollbar-hide">
                                    {property.images.map((image, index) => (
                                        <button key={index} onClick={() => setSelectedImageIndex(index)} className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden transition-all ${selectedImageIndex === index ? 'ring-2 ring-primary-500 opacity-100' : 'opacity-50 hover:opacity-80'}`}>
                                            <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[320px] bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
                            <Home className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Price */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`badge ${property.available ? 'badge-success' : 'badge-danger'}`}>
                                    {property.available ? 'For Rent' : 'Unavailable'}
                                </span>
                                {property.totalReviews > 0 && (
                                    <span className="badge badge-neutral">
                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                        {property.averageRating.toFixed(1)} ({property.totalReviews})
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight">{property.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><MapPin size={16} className="text-primary-500" /> {property.address}</p>
                            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 mt-3">₹{property.price.toLocaleString()}<span className="text-sm font-medium text-gray-400">/month</span></p>
                        </div>

                        {/* Features Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: Bed, label: 'Bedrooms', value: property.bedrooms },
                                { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
                                { icon: Maximize2, label: 'Area', value: `${property.area} sqft` },
                                { icon: ShieldCheck, label: 'Furnishing', value: property.furnishing?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A' },
                            ].map(f => (
                                <div key={f.label} className="card p-4 text-center hover:translate-y-0 hover:shadow-sm">
                                    <f.icon size={20} className="mx-auto text-gray-400 mb-2" />
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{f.value}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{f.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About this property</h2>
                            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm space-y-3">
                                {property.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="card p-6 hover:translate-y-0 hover:shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What this place offers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {(property.amenities || ['WiFi', 'Parking', 'AC', 'Kitchen', 'Washing Machine', '24/7 Security']).map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                        <span>{typeof amenity === 'string' ? amenity.charAt(0).toUpperCase() + amenity.slice(1) : amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Location</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1"><MapPin size={14} /> {property.address}</p>
                            <div className="h-[300px] md:h-[350px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative z-0">
                                <PropertyMap properties={[property]} center={{ lat: property.location.coordinates[1], lng: property.location.coordinates[0] }} />
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Reviews</h2>
                            <ReviewSection propertyId={property._id} ownerId={property.owner._id} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-5">
                            {/* Host Card */}
                            <div className="card p-6 hover:translate-y-0 hover:shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Property Owner</h3>
                                <div className="flex items-center gap-3.5 mb-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {property.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{property.owner.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                                            <ShieldCheck size={13} /> Verified
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-5">
                                    <div className="flex items-center gap-2.5"><Mail size={15} className="text-gray-400" />{property.owner.email}</div>
                                    <div className="flex items-center gap-2.5"><Phone size={15} className="text-gray-400" />{property.owner.phone}</div>
                                </div>
                                {user?.role === 'tenant' && property.available ? (
                                    <button onClick={handleContactOwner} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                                        <MessageCircle size={18} /> Message Owner
                                    </button>
                                ) : !property.available && (
                                    <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-center text-sm font-semibold">
                                        Currently Unavailable
                                    </div>
                                )}
                            </div>

                            {/* Rules */}
                            <div className="card p-6 hover:translate-y-0 hover:shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Property Rules</h3>
                                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                                    {['No smoking inside', 'Pets with approval', 'Security deposit required'].map((rule, i) => (
                                        <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />{rule}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function PropertyDetail() {
    return <ProtectedRoute><PropertyDetailContent /></ProtectedRoute>;
}
