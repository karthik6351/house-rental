'use client';

import { Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
}

export default function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;

        // Try native share first (Mobile/Tablet)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                return;
            } catch (error) {
                // User cancelled or share failed, fallback to copy
                console.log('Share cancelled or failed', error);
            }
        }

        // Fallback to clipboard copy (Desktop)
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!', {
                icon: '🔗',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy', error);
            toast.error('Failed to copy link');
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors ${className}`}
            title="Share this property"
        >
            {copied ? (
                <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Copied!</span>
                </>
            ) : (
                <>
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                </>
            )}
        </button>
    );
}
