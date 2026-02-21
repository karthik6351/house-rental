'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Clock, ArrowRight, Sparkles, Building2, MessageCircle, Star, ChevronLeft, ChevronRight as ChevRight } from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }),
};

const testimonials = [
    { name: 'Priya Sharma', role: 'Tenant', text: 'Found my dream apartment in just 2 days. The real-time chat with owners made everything so easy!', rating: 5 },
    { name: 'Rahul Verma', role: 'Property Owner', text: 'Managing my 5 properties has never been easier. The lead tracking and deal receipts are game-changers.', rating: 5 },
    { name: 'Anjali Patel', role: 'Tenant', text: 'The map search feature helped me find properties near my workplace. Brilliant user experience!', rating: 4 },
];

export default function Home() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="min-h-screen overflow-hidden">
            {/* ==================== HERO SECTION ==================== */}
            <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 lg:pt-0 lg:pb-0">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-background-light dark:bg-background-dark">
                    <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] rounded-full bg-primary-400/15 dark:bg-primary-600/10 blur-[120px] animate-blob" />
                    <div className="absolute top-[15%] right-[-12%] w-[50%] h-[50%] rounded-full bg-secondary-400/10 dark:bg-secondary-600/8 blur-[140px] animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-15%] left-[15%] w-[55%] h-[55%] rounded-full bg-accent-400/10 dark:bg-accent-600/8 blur-[130px] animate-blob animation-delay-4000" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.04]" />
                </div>

                <div className="container mx-auto px-5 sm:px-6 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col gap-6 text-center lg:text-left"
                        >
                            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 w-fit mx-auto lg:mx-0 border border-primary-100 dark:border-primary-800/40">
                                <Sparkles size={14} className="text-primary-500" />
                                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Premium Rentals Platform</span>
                            </motion.div>

                            <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]">
                                Find Your{' '}
                                <span className="gradient-text">Perfect Place</span>
                                {' '}to Call Home
                            </motion.h1>

                            <motion.p custom={2} variants={fadeUp} className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Browse verified premium properties, chat directly with owners, and secure your dream space — all in one seamless platform.
                            </motion.p>

                            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mt-2 justify-center lg:justify-start">
                                <Link href="/tenant/search" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-base px-7 py-3.5">
                                    <Search size={18} />
                                    <span>Browse Properties</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/register" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-7 py-3.5">
                                    <Building2 size={18} />
                                    <span>List Property</span>
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div custom={4} variants={fadeUp} className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-gray-200/60 dark:border-gray-800/40">
                                <div>
                                    <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        <AnimatedCounter target={2000} suffix="+" />
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Properties</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        <AnimatedCounter target={10000} suffix="+" />
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Happy Users</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        4.9
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5 flex items-center gap-1 justify-center lg:justify-start">
                                        <Star size={12} className="fill-amber-400 text-amber-400" /> Rating
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative w-full aspect-[4/5] max-w-lg mx-auto">
                                {/* Glow behind */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-secondary-500/15 to-accent-400/10 rounded-[2.5rem] transform rotate-2 scale-[1.03] -z-10 blur-2xl" />

                                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-float border border-white/20 dark:border-gray-800/50">
                                    <img
                                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
                                        alt="Luxury Modern House"
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [-8, 8, -8] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -left-6 top-16 glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-float"
                                >
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Verified</p>
                                        <p className="text-[11px] text-gray-500">100% Secure</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [8, -8, 8] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -right-6 bottom-28 glass-panel p-3.5 rounded-2xl flex items-center gap-3 shadow-float"
                                >
                                    <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-2.5 rounded-xl">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Prime Locations</p>
                                        <p className="text-[11px] text-gray-500">Pan India</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== FEATURES SECTION ==================== */}
            <section className="py-20 lg:py-28 bg-white dark:bg-[#0a0a0c] relative z-10">
                <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-2xl mx-auto mb-14"
                    >
                        <span className="badge-info mb-4 inline-flex">Why EasyRent</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                            Everything You Need, In One Platform
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            From search to signing, we've built the most complete rental experience.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                icon: Search,
                                title: 'Smart Search',
                                desc: 'Advanced filters, map view, and location-based search to find exactly what you need.',
                                color: 'primary',
                                gradient: 'from-primary-500 to-primary-600',
                            },
                            {
                                icon: MessageCircle,
                                title: 'Real-Time Chat',
                                desc: 'Instant messaging with property owners. Get answers and schedule visits in seconds.',
                                color: 'secondary',
                                gradient: 'from-secondary-500 to-secondary-600',
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Secure Deals',
                                desc: 'Digital deal confirmations, receipts, and smart notifications keep everything transparent.',
                                color: 'emerald',
                                gradient: 'from-emerald-500 to-emerald-600',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`card p-7 lg:p-8 text-center group ${i === 1 ? 'md:-translate-y-4' : ''}`}
                            >
                                <div className={`mx-auto w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform text-white`}>
                                    <feature.icon size={26} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== HOW IT WORKS ==================== */}
            <section className="py-20 lg:py-28 relative bg-gray-50/50 dark:bg-[#09090b]">
                <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto mb-14"
                    >
                        <span className="badge-neutral mb-4 inline-flex">How It Works</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                            Rent in 3 Simple Steps
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Search & Filter', desc: 'Use our smart filters to browse through thousands of verified properties near you.' },
                            { step: '02', title: 'Connect & Chat', desc: 'Message property owners directly, schedule visits, and ask questions in real-time.' },
                            { step: '03', title: 'Confirm & Move In', desc: 'Finalize your deal with digital agreements and get ready to move into your new space.' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative flex flex-col items-center text-center p-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800/40 flex items-center justify-center mb-5">
                                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="py-20 lg:py-28 bg-white dark:bg-[#0a0a0c]">
                <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="badge-success mb-4 inline-flex">Testimonials</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Loved by Thousands
                        </h2>
                    </motion.div>

                    <div className="relative">
                        <div className="card p-8 lg:p-12 text-center relative overflow-visible">
                            <div className="flex justify-center mb-4">
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6 max-w-2xl mx-auto italic">
                                &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                            </p>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
                                <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentTestimonial(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'w-6 bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA SECTION ==================== */}
            <section className="py-20 lg:py-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:via-primary-800 dark:to-gray-900 -z-20" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-500/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />

                <div className="container mx-auto px-5 sm:px-6 max-w-3xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
                            Ready to find your dream place?
                        </h2>
                        <p className="text-primary-100/80 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                            Join thousands who have already found their perfect homes and commercial spaces with EasyRent.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-50 px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-black/15 active:scale-[0.97] transition-all group"
                        >
                            Get Started Free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
