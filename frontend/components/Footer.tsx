'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-[#0a0a0c] border-t border-gray-100 dark:border-gray-800/50 relative z-10 w-full overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary-500/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Main footer content */}
            <div className="container mx-auto px-6 max-w-7xl pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md">
                                <Image src="/logo.png" alt="EasyRent" fill className="object-cover" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                Easy<span className="text-primary-600 dark:text-primary-400">Rent</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
                            Premium rental platform connecting property owners with verified tenants.
                            Find your perfect space with confidence.
                        </p>
                        <div className="flex items-center gap-2">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Linkedin, href: '#' },
                            ].map(({ icon: Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="flex flex-col gap-3">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/tenant/search', label: 'Properties' },
                                { href: '/login', label: 'Sign In' },
                                { href: '/register', label: 'Create Account' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors flex items-center gap-1 group">
                                        {link.label}
                                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="lg:col-span-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
                        <ul className="flex flex-col gap-3">
                            {[
                                'For Property Owners',
                                'For Renters',
                                'Corporate Leasing',
                                'Property Management',
                            ].map(service => (
                                <li key={service}>
                                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">
                                        {service}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
                        <ul className="flex flex-col gap-4">
                            <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400 text-sm">
                                <MapPin size={16} className="text-primary-500 mt-0.5 shrink-0" />
                                <span>123 Innovation Drive, Tech Hub, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                                <Phone size={16} className="text-primary-500 shrink-0" />
                                <span>+1 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                                <Mail size={16} className="text-primary-500 shrink-0" />
                                <span>support@easyrent.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 dark:text-gray-600 text-xs">
                        &copy; {currentYear} EasyRent Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-600">
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
