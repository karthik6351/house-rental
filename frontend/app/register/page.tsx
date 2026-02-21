'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Mail, Lock, User, Phone, Building2, Home as HomeIcon, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        role: 'tenant' as 'owner' | 'tenant',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            setIsLoading(false);
            return;
        }
        try {
            const user = await register(formData);
            if (user.role === 'owner') router.push('/owner/dashboard');
            else router.push('/tenant/search');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = () => {
        const p = formData.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return Math.min(score, 4);
    };

    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/80 to-gray-900/95 z-10" />
                <motion.img
                    key={formData.role}
                    initial={{ opacity: 0.7, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    src={formData.role === 'owner'
                        ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1740"
                        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1740"
                    }
                    alt="Real Estate"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 flex flex-col justify-between h-full p-12 xl:p-16 w-full">
                    <Link href="/" className="flex items-center gap-2.5 w-fit">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                            <Image src="/logo.png" alt="EasyRent" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">
                            Easy<span className="text-primary-300">Rent</span>
                        </span>
                    </Link>

                    <motion.div
                        key={formData.role + "-text"}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mt-auto"
                    >
                        <span className="inline-block px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white font-medium text-xs mb-5 border border-white/10 uppercase tracking-wider">
                            {formData.role === 'owner' ? "For Property Owners" : "For Tenants"}
                        </span>
                        <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
                            {formData.role === 'owner' ? "Maximize your property investment." : "Find the place you truly deserve."}
                        </h2>
                        <p className="text-gray-300/80 text-base leading-relaxed">
                            {formData.role === 'owner'
                                ? "Join thousands of landlords who trust our platform to find verified tenants securely."
                                : "Discover premium rentals tailored to your lifestyle and budget."}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-[56%] flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
                <div className="w-full max-w-lg space-y-6 relative z-10 py-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md">
                                <Image src="/logo.png" alt="EasyRent" fill className="object-cover" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">
                                Easy<span className="text-primary-600">Rent</span>
                            </span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Join EasyRent and start your journey today</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 p-4 rounded-2xl"
                        >
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('tenant')}
                            className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${formData.role === 'tenant'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/15'
                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                        >
                            {formData.role === 'tenant' && (
                                <CheckCircle2 size={16} className="absolute top-3 right-3 text-primary-600 dark:text-primary-400" />
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'tenant' ? 'bg-primary-100 dark:bg-primary-800/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                <HomeIcon size={22} />
                            </div>
                            <span className={`text-sm font-semibold ${formData.role === 'tenant' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                I&apos;m Renting
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('owner')}
                            className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${formData.role === 'owner'
                                ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/15'
                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                        >
                            {formData.role === 'owner' && (
                                <CheckCircle2 size={16} className="absolute top-3 right-3 text-secondary-600 dark:text-secondary-400" />
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.role === 'owner' ? 'bg-secondary-100 dark:bg-secondary-800/30 text-secondary-600 dark:text-secondary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                <Building2 size={22} />
                            </div>
                            <span className={`text-sm font-semibold ${formData.role === 'owner' ? 'text-secondary-700 dark:text-secondary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                I&apos;m Listing
                            </span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field pl-11" placeholder="John Doe" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field pl-11" placeholder="you@example.com" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" className="input-field pl-11" placeholder="10-digit number" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required minLength={6}
                                    className="input-field pl-11 pr-11"
                                    placeholder="Min 6 characters"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Password Strength */}
                            {formData.password && (
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="flex gap-1 flex-1">
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-800'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">{strength > 0 ? strengthLabels[strength - 1] : ''}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 group mt-6 disabled:opacity-60 disabled:cursor-not-allowed ${formData.role === 'owner'
                                ? 'bg-secondary-600 hover:bg-secondary-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-[0_4px_20px_rgba(219,39,119,0.25)] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2'
                                : 'btn-primary'
                                }`}
                            style={{ transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
