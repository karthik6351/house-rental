'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Home, ArrowRight, Mail, Lock, User, Phone, Building, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
            const user = await register(formData);
            if (user.role === 'owner') {
                router.push('/owner/dashboard');
            } else {
                router.push('/tenant/search');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background-light dark:bg-background-dark">

            {/* Left Image Section */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/60 to-transparent z-10 mix-blend-multiply"></div>
                {/* Dynamically change image based on role selection */}
                <motion.img
                    key={formData.role}
                    initial={{ opacity: 0.8, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={formData.role === 'owner'
                        ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1740&ixlib=rb-4.0.3"
                        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1740&ixlib=rb-4.0.3"
                    }
                    alt="Real Estate"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 flex flex-col justify-between h-full p-16 w-full">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                            <Home size={28} />
                        </div>
                        <span className="font-bold text-3xl tracking-tight text-white drop-shadow-md">
                            Easy<span className="text-primary-400">Rent</span>
                        </span>
                    </Link>

                    <div className="max-w-md mt-auto">
                        <motion.div
                            key={formData.role + "-text"}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-medium text-sm mb-6 border border-white/20">
                                {formData.role === 'owner' ? "For Property Owners" : "For Tenants"}
                            </span>
                            <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
                                {formData.role === 'owner'
                                    ? "Maximize your property yields."
                                    : "Find the place you deserve."
                                }
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed shadow-sm">
                                {formData.role === 'owner'
                                    ? "Join thousands of landlords who trust our platform to find verified tenants securely and quickly."
                                    : "Discover curated premium rentals tailored to your lifestyle and budget, all in one place."
                                }
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto">
                <div className="w-full max-w-lg space-y-8 relative z-10 py-10">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create an account</h1>
                        <p className="text-gray-500 dark:text-gray-400">Join EasyRent and start your journey today</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3"
                        >
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    {/* Role Selection Tabs */}
                    <div className="bg-gray-100 dark:bg-[#1C1C1F] p-1.5 rounded-2xl flex relative w-full mb-8">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('tenant')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all z-10 ${formData.role === 'tenant' ? 'text-primary-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <HomeIcon size={18} />
                            I'm looking to rent
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('owner')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all z-10 ${formData.role === 'owner' ? 'text-secondary-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <Building size={18} />
                            I want to list property
                        </button>

                        {/* Animated background pill */}
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 ease-out`}
                            style={{
                                left: formData.role === 'tenant' ? '6px' : 'calc(50% + 3px)',
                                border: formData.role === 'tenant' ? '1px solid rgba(84, 107, 250, 0.2)' : '1px solid rgba(220, 69, 146, 0.2)'
                            }}
                        ></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-11 shadow-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-11 shadow-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="input-field pl-11 shadow-sm"
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="input-field pl-11 shadow-sm"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 group mt-8 pt-4 disabled:opacity-50 ${formData.role === 'owner' ? 'btn-secondary text-white bg-secondary-600 hover:bg-secondary-700 border-none' : 'btn-primary'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-1 hover:underline underline-offset-4">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
