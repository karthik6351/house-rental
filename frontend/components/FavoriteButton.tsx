'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoriteAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteButtonProps {
    propertyId: string;
    initialIsFavorite?: boolean;
    onToggle?: (isFavorite: boolean) => void;
    className?: string;
}

export default function FavoriteButton({ propertyId, initialIsFavorite = false, onToggle, className = '' }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // If initial state isn't provided/reliable, check it
        const checkStatus = async () => {
            try {
                const response = await favoriteAPI.checkStatus(propertyId);
                setIsFavorite(response.data.isFavorite);
            } catch (error) {
                console.error('Failed to check favorite status', error);
            }
        };

        // Only check if we strongly suspect we need to (e.g. on detail page)
        // For lists, we might pass it in. For now, let's play safe and rely on passed props or lazy check
        // Ideally, lists should pre-fetch this. To avoid API spam, we'll assume prop is correct or check only if unsure.
        // For this implementation, we'll blindly trust the prop initially, but maybe check if user interaction happens.
        // Actually, let's trigger a check on mount to be sure, but catch errors silently (e.g., if not logged in)
        if (localStorage.getItem('token')) {
            checkStatus();
        }
    }, [propertyId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to property detail
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newState = !isFavorite;
        setIsFavorite(newState);
        setIsLoading(true);

        try {
            await favoriteAPI.toggle(propertyId);
            if (onToggle) onToggle(newState);
            toast.success(newState ? 'Added to favorites' : 'Removed from favorites', {
                position: 'bottom-center',
                duration: 2000,
                icon: newState ? '❤️' : '💔',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        } catch (error: any) {
            // Revert on error
            setIsFavorite(!newState);
            if (error.response?.status === 401) {
                toast.error('Please login to save favorites');
            } else {
                toast.error('Failed to update favorite');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            onClick={handleToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.8 }}
            className={`p-2 rounded-full transition-colors ${isFavorite
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
                } backdrop-blur-sm shadow-sm ${className}`}
            disabled={isLoading}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <AnimatePresence mode='wait'>
                {isFavorite ? (
                    <motion.div
                        key="filled"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Heart className="w-5 h-5 fill-current" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="outline"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Heart className="w-5 h-5" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
