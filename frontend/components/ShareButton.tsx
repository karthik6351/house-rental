'use client';

import React from 'react';
import { Share2, Link2, MessageCircle, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ShareButtonProps {
    propertyId: string;
    title: string;
}

export default function ShareButton({ propertyId, title }: ShareButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/property/${propertyId}` : '';

    const copyLink = async () => {
        try { await navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); setIsOpen(false); }
        catch { toast.error('Failed to copy'); }
    };

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out: ${title}\n${shareUrl}`)}`, '_blank');
        setIsOpen(false);
    };

    const shareEmail = () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`;
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all">
                <Share2 size={18} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1f] rounded-2xl shadow-float border border-gray-200 dark:border-gray-800 z-50 p-1.5"
                        >
                            <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Link2 size={16} /> Copy Link
                            </button>
                            <button onClick={shareWhatsApp} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <MessageCircle size={16} className="text-green-600" /> WhatsApp
                            </button>
                            <button onClick={shareEmail} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Mail size={16} className="text-blue-500" /> Email
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
