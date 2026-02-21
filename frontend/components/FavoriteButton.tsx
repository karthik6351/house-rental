'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { favoriteAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteButtonProps {
    propertyId: string;
    size?: number;
    className?: string;
}

export default function FavoriteButton({ propertyId, size = 20, className = '' }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) checkFavoriteStatus();
    }, [user, propertyId]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await favoriteAPI.checkStatus(propertyId);
            setIsFavorited(response.data.isFavorited);
        } catch (error) { /* silent */ }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || isLoading) return;
        setIsLoading(true);
        try {
            await favoriteAPI.toggle(propertyId);
            setIsFavorited(!isFavorited);
            if (!isFavorited) {
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 600);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFavorited
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-black/30 backdrop-blur-md text-white hover:bg-black/50'
                } ${className}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <motion.div
                animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <Heart
                    size={size}
                    className={isFavorited ? 'fill-current' : ''}
                    strokeWidth={2}
                />
            </motion.div>

            {/* Burst particles on favorite */}
            <AnimatePresence>
                {isAnimating && (
                    <>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                                    y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                                    opacity: [1, 1, 0],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.03 }}
                                className="absolute w-1.5 h-1.5 rounded-full bg-red-400"
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
        </button>
    );
}
