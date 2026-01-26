'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import LocationPicker from '@/components/LocationPicker';


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
            setError(err.response?.data?.message || 'Failed to create property');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <img src="/logo.png" alt="Easy Rent" className="h-8 w-auto" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <h1 className="text-3xl font-bold gradient-text mb-8">Add New Property</h1>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Property Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                minLength={5}
                                className="input-field"
                                placeholder="Beautiful 3BHK in Downtown"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                minLength={20}
                                rows={4}
                                className="input-field resize-none"
                                placeholder="Describe your property..."
                            />
                        </div>

                        {/* Location Picker Map */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Property Location *
                            </label>
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={location || undefined}
                                initialAddress={formData.address}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address * {location && <span className="text-green-600 text-xs">(Auto-filled from map)</span>}
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="123 Main Street, City, State, ZIP"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Monthly Rent (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="input-field"
                                    placeholder="25000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Area (sq ft) *
                                </label>
                                <input
                                    type="number"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="input-field"
                                    placeholder="1200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bedrooms *
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="50"
                                    className="input-field"
                                    placeholder="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bathrooms *
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="50"
                                    className="input-field"
                                    placeholder="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Furnishing *
                                </label>
                                <select
                                    name="furnishing"
                                    value={formData.furnishing}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="unfurnished">Unfurnished</option>
                                    <option value="semi-furnished">Semi-furnished</option>
                                    <option value="furnished">Furnished</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Property Images (Max 10)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="input-field cursor-pointer"
                            />
                            <p className="text-sm text-gray-500 mt-2">Upload up to 10 images (JPEG, PNG, WebP - Max 5MB each)</p>

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {isLoading ? 'Creating Property...' : 'Create Property'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
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
