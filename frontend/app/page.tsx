'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Building, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh]">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-background-light dark:bg-background-dark">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-900/30 blur-[120px] animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-400/20 dark:bg-secondary-900/30 blur-[120px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-900/30 blur-[120px] animate-blob animation-delay-4000"></div>

                    {/* Grid Pattern overlay */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05]"></div>
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col gap-8 text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/50 dark:bg-black/20 w-fit mx-auto lg:mx-0 border border-primary-100 dark:border-primary-900/30">
                                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Discover your next space</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                                Find the <span className="gradient-text">Perfect Place</span> to Live and Work.
                            </h1>

                            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Experience a seamless journey to your new premium property.
                                High-end apartments, commercial spaces, and villas await you.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center lg:justify-start">
                                <Link href="/tenant/search" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-lg px-8 py-4">
                                    <Search size={20} />
                                    <span>Browse Properties</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/register" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4">
                                    <Building size={20} />
                                    <span>List a Property</span>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-gray-200 dark:border-gray-800/50">
                                <div>
                                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">2k+</h4>
                                    <p className="text-sm text-gray-500 font-medium">Properties</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">10k+</h4>
                                    <p className="text-sm text-gray-500 font-medium">Happy Users</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">4.9</h4>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1"><StarIcon /> App Rating</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Image/Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative hidden lg:block h-[600px] w-full"
                        >
                            {/* Decorative elements behind image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-[2.5rem] transform rotate-3 scale-[1.02] -z-10 blur-xl"></div>

                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border flex items-center justify-center border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                                {/* Next Image component should ideally be used here if an asset was available */}
                                {/* For pure UI mockup feeling, we use a beautiful placeholder or generic house */}
                                <img
                                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
                                    alt="Luxury Modern House"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 ease-out"
                                />

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [-10, 10, -10] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -left-8 top-20 glass-panel p-4 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Verified Listings</p>
                                        <p className="text-xs text-gray-500">100% Secure</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [10, -10, 10] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -right-8 bottom-32 glass-panel p-4 rounded-2xl flex items-center gap-4"
                                >
                                    <div className="bg-primary-500/20 text-primary-600 dark:text-primary-400 p-3 rounded-xl">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Prime Locations</p>
                                        <p className="text-xs text-gray-500">Global Reach</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-[#0a0a0b] relative z-10">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose EasyRent?</h2>
                        <p className="text-gray-600 dark:text-gray-400">We redefine the rental experience with industry-leading features, ensuring comfort, security, and speed.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card text-center hover:border-primary-500/50 group">
                            <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Search</h3>
                            <p className="text-gray-600 dark:text-gray-400">Find exactly what you are looking for with our advanced filters and map view.</p>
                        </div>

                        <div className="card text-center hover:border-secondary-500/50 group transform md:-translate-y-4">
                            <div className="mx-auto w-16 h-16 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-Time Chat</h3>
                            <p className="text-gray-600 dark:text-gray-400">Connect instantly with property owners. Get your queries resolved in seconds.</p>
                        </div>

                        <div className="card text-center hover:border-green-500/50 group">
                            <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure Deals</h3>
                            <p className="text-gray-600 dark:text-gray-400">Complete transparency with our secure digital agreement tracking and notifications.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-600 dark:bg-primary-900 -z-20"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-500/30 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to find your dream place?</h2>
                    <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
                        Join thousands of users who have already found their perfect homes and commercial spaces with EasyRent.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/10 active:scale-95 transition-all">
                        Get Started for Free
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

        </main>
    );
}

function StarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent-500">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
    );
}
