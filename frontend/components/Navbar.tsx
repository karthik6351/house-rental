'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/30">
                            <Home size={24} />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                            Easy<span className="text-primary-600">Rent</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex flex-1 justify-center space-x-8">
                        <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Home</Link>
                        <Link href="/tenant/search" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Properties</Link>
                        <Link href="/#about" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About Us</Link>
                    </nav>

                    {/* Desktop Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard'}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1C1C1F] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C1C1F] transition-colors">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary flex items-center gap-2 py-2.5">
                                    <UserPlus size={18} />
                                    <span>Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-700 dark:text-gray-200 p-2"
                        onClick={toggleMenu}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-gray-200 dark:border-gray-800"
                    >
                        <div className="flex flex-col px-6 py-6 space-y-4">
                            <Link href="/" className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1C1C1F] font-medium text-gray-900 dark:text-white" onClick={toggleMenu}>Home</Link>
                            <Link href="/tenant/search" className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1C1C1F] font-medium text-gray-900 dark:text-white" onClick={toggleMenu}>Browse Properties</Link>

                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>

                            {user ? (
                                <>
                                    <Link
                                        href={user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard'}
                                        onClick={toggleMenu}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                                    >
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { logout(); toggleMenu(); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-left"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-2">
                                    <Link href="/login" onClick={toggleMenu} className="flex justify-center items-center gap-2 w-full py-3 rounded-xl font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1C1C1F]">
                                        <LogIn size={20} />
                                        Log In
                                    </Link>
                                    <Link href="/register" onClick={toggleMenu} className="btn-primary w-full flex justify-center py-3">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
