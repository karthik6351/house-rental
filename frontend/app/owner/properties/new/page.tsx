import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import { Building, MapPin, IndianRupee, Bed, Bath, LayoutDashboard, Sofa, Image as ImageIcon, X, ArrowLeft, UploadCloud, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

function NewPropertyContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        furnishing: 'unfurnished',
    });
    const [images, setImages] = useState<File[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            if (fileList.length + images.length > 10) {
                setError('Maximum 10 images allowed');
                return;
            }
            setImages([...images, ...fileList]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleLocationSelect = (locationData: { lat: number; lng: number; address: string }) => {
        setLocation({ lat: locationData.lat, lng: locationData.lng });
        setFormData({ ...formData, address: locationData.address });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('address', formData.address);
            data.append('price', formData.price);
            data.append('bedrooms', formData.bedrooms);
            data.append('bathrooms', formData.bathrooms);
            data.append('area', formData.area);
            data.append('furnishing', formData.furnishing);

            // Add coordinates if location was selected from map
            if (location) {
                data.append('lat', location.lat.toString());
                data.append('lng', location.lng.toString());
            }

            images.forEach((image) => {
                data.append('images', image);
            });

            await propertyAPI.create(data);
            router.push('/owner/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create property';
            console.error('Submission Error:', err.response?.data);
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md sticky top-[72px] z-20 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#1C1C1F] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                Add New Property
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                List your property to start earning rental income.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1C1C1F] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 p-6 md:p-8 overflow-hidden"
                >
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl mb-8 flex items-center gap-3">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Details */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Basic Details
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Property Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            minLength={5}
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="e.g., Luxurious 3BHK in Downtown"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="block w-full p-4 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                                        placeholder="Describe what makes your property special... (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location Details */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Location
                            </h2>
                            <div className="space-y-6">
                                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative">
                                    <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700 select-none pointer-events-none flex gap-3 items-center">
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-400">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Drag Pin To Select Location</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formData.address || 'Loading map...'}</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px]">
                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            initialLocation={location || undefined}
                                            initialAddress={formData.address}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Full Address <span className="text-red-500">*</span>
                                        {location && <span className="text-primary-600 dark:text-primary-400 ml-2 font-normal text-xs">(Auto-filled from map)</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="e.g., 123 Main Street, City, State, ZIP"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Property Features */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                Features & Rent
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Monthly Rent <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IndianRupee className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="price"
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400 focus:font-bold"
                                            placeholder="e.g., 25000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="area" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Area (sq ft)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LayoutDashboard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="area"
                                            type="number"
                                            name="area"
                                            value={formData.area}
                                            onChange={handleChange}
                                            min="0"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="e.g., 1200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bedrooms" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Bedrooms
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Bed className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="bedrooms"
                                            type="number"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleChange}
                                            min="0"
                                            max="50"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bathrooms" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Bathrooms
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Bath className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="bathrooms"
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleChange}
                                            min="0"
                                            max="50"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="e.g., 2"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="furnishing" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Furnishing
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Sofa className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="furnishing"
                                            name="furnishing"
                                            value={formData.furnishing}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors text-gray-900 dark:text-white appearance-none cursor-pointer"
                                        >
                                            <option value="unfurnished">Unfurnished</option>
                                            <option value="semi-furnished">Semi-furnished</option>
                                            <option value="fully-furnished">Fully-furnished</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Images */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                                Property Images
                            </h2>
                            <div>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-[#121214] hover:bg-white dark:hover:bg-[#1C1C1F] transition-colors relative cursor-pointer overflow-hidden p-8 flex flex-col items-center justify-center group text-center">
                                    <input
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-full mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">JPEG, PNG, WebP up to 5MB (Max 10 Images)</p>
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                                        <AnimatePresence>
                                            {images.map((image, index) => (
                                                <motion.div
                                                    key={`${image.name}-${index}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-800"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transform -translate-y-2 group-hover:translate-y-0 transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Listing'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}

export default function NewProperty() {
    return (
        <ProtectedRoute requiredRole="owner">
            <NewPropertyContent />
        </ProtectedRoute>
    );
}
