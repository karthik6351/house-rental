'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Search, Home, Heart, MessageCircle, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/tenant/search', label: 'Properties' },
    ];

    const getDashboardLink = () => {
        if (!user) return '/login';
        return user.role === 'owner' ? '/owner/dashboard' : '/tenant/search';
    };

    return (
        <>
            {/* Top Navbar */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                        ? 'glass-panel py-2 shadow-soft'
                        : 'bg-transparent py-3 md:py-4'
                    }`}
            >
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                <Image
                                    src="/logo.png"
                                    alt="EasyRent"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900 dark:text-white">
                                Easy<span className="text-primary-600 dark:text-primary-400">Rent</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5 font-medium text-sm transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Right Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <NotificationBell className="text-gray-600 dark:text-gray-300" />

                                    <Link
                                        href={getDashboardLink()}
                                        className="btn-ghost flex items-center gap-2 text-sm"
                                    >
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {profileOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1f] rounded-2xl shadow-float border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
                                                    >
                                                        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                        </div>
                                                        <div className="p-1.5">
                                                            <Link
                                                                href={getDashboardLink()}
                                                                onClick={() => setProfileOpen(false)}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                            >
                                                                <LayoutDashboard size={16} />
                                                                Dashboard
                                                            </Link>
                                                            {user.role === 'tenant' && (
                                                                <Link
                                                                    href="/tenant/favorites"
                                                                    onClick={() => setProfileOpen(false)}
                                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                                >
                                                                    <Heart size={16} />
                                                                    Favorites
                                                                </Link>
                                                            )}
                                                            <button
                                                                onClick={() => { logout(); setProfileOpen(false); }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <LogOut size={16} />
                                                                Sign Out
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/login" className="btn-ghost text-sm flex items-center gap-2">
                                        <LogIn size={16} />
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn-primary text-sm py-2.5 px-5">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                                onClick={toggleMenu}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-[#131316] z-50 md:hidden shadow-2xl"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                                        <Link href="/" onClick={toggleMenu} className="flex items-center gap-2">
                                            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                                                <Image src="/logo.png" alt="EasyRent" fill className="object-cover" />
                                            </div>
                                            <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                Easy<span className="text-primary-600">Rent</span>
                                            </span>
                                        </Link>
                                        <button onClick={toggleMenu} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <X size={20} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-1">
                                        {navLinks.map(link => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={toggleMenu}
                                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-gray-900 dark:text-white transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}

                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

                                        {user ? (
                                            <>
                                                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.role === 'owner' ? 'Property Owner' : 'Tenant'}</p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={getDashboardLink()}
                                                    onClick={toggleMenu}
                                                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary-50 dark:bg-primary-900/15 text-primary-700 dark:text-primary-300 font-medium"
                                                >
                                                    <LayoutDashboard size={18} />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => { logout(); toggleMenu(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-left"
                                                >
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-3 pt-2">
                                                <Link
                                                    href="/login"
                                                    onClick={toggleMenu}
                                                    className="flex justify-center items-center gap-2 w-full py-3.5 rounded-2xl font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <LogIn size={18} />
                                                    Log In
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    onClick={toggleMenu}
                                                    className="btn-primary w-full flex justify-center py-3.5 text-center"
                                                >
                                                    Get Started
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>

            {/* Bottom Navigation (Mobile Only) */}
            {user && (
                <nav className="bottom-nav" aria-label="Mobile navigation">
                    <div className="flex items-center justify-around h-full px-2">
                        <Link href="/" className="bottom-nav-item">
                            <Home size={22} />
                            <span>Home</span>
                        </Link>
                        <Link href="/tenant/search" className="bottom-nav-item">
                            <Search size={22} />
                            <span>Search</span>
                        </Link>
                        {user.role === 'tenant' ? (
                            <>
                                <Link href="/tenant/favorites" className="bottom-nav-item">
                                    <Heart size={22} />
                                    <span>Saved</span>
                                </Link>
                                <Link href="/tenant/messages" className="bottom-nav-item">
                                    <MessageCircle size={22} />
                                    <span>Chat</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/owner/dashboard" className="bottom-nav-item">
                                    <LayoutDashboard size={22} />
                                    <span>Dashboard</span>
                                </Link>
                                <Link href="/owner/messages" className="bottom-nav-item">
                                    <MessageCircle size={22} />
                                    <span>Chat</span>
                                </Link>
                            </>
                        )}
                        <Link href={getDashboardLink()} className="bottom-nav-item">
                            <User size={22} />
                            <span>Profile</span>
                        </Link>
                    </div>
                </nav>
            )}
        </>
    );
}
