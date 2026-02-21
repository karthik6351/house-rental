'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-[#0a0a0b] border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 relative z-10 w-full overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Col */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="bg-primary-600 text-white p-2 rounded-xl">
                                <Home size={24} />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                                Easy<span className="text-primary-600">Rent</span>
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Premium commercial and residential properties tailored to your needs. Finding your perfect space has never been easier.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Quick Links</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link></li>
                            <li><Link href="/tenant/search" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Properties</Link></li>
                            <li><Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link></li>
                            <li><Link href="/register" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Create Account</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Services</h4>
                        <ul className="flex flex-col gap-4">
                            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">For Property Owners</a></li>
                            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">For Renters</a></li>
                            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Corporate Leasing</a></li>
                            <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Property Management</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Contact Us</h4>
                        <ul className="flex flex-col gap-5">
                            <li className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                                <div className="mt-1 text-primary-600 dark:text-primary-400"><MapPin size={20} /></div>
                                <span>123 Innovation Drive, Tech Hub, NY 10001, USA</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                <div className="text-primary-600 dark:text-primary-400"><Phone size={20} /></div>
                                <span>+1 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                <div className="text-primary-600 dark:text-primary-400"><Mail size={20} /></div>
                                <span>support@easyrent.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} EasyRent Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-500">
                        <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
