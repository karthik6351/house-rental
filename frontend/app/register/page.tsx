'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'tenant' as 'owner' | 'tenant',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleChange = (role: 'owner' | 'tenant') => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate phone number
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            setIsLoading(false);
            return;
        }

        try {
            await register(formData);
            // Auth context will handle redirect based on role
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
            <div className="max-w-md w-full">
                {/* Logo/Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold gradient-text">House Rent</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account</p>
                </div>

                {/* Register Card */}
                <div className="card-glass backdrop-blur-xl animate-slide-up">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Sign Up
                    </h2>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('tenant')}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.role === 'tenant'
                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🏠</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Tenant</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Looking for property</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('owner')}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.role === 'owner'
                                    ? 'border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-secondary-400'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🏢</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">Owner</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Listing property</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                className="input-field"
                                placeholder="1234567890"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="input-field"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Minimum 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full disabled:opacity-50 disabled:cursor-not-allowed ${formData.role === 'owner' ? 'btn-secondary' : 'btn-primary'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                `Create ${formData.role === 'owner' ? 'Owner' : 'Tenant'} Account`
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
