'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: {
        _id: string;
        sender: { _id: string; name: string };
        content: string;
        createdAt: string;
        read: boolean;
    };
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}
        >
            <div
                className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 relative ${isOwn
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-lg'
                        : 'bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white rounded-2xl rounded-bl-lg border border-gray-100 dark:border-gray-800'
                    }`}
            >
                {!isOwn && (
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 mb-0.5">
                        {message.sender.name}
                    </p>
                )}
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{time}</span>
                    {isOwn && (
                        message.read
                            ? <CheckCheck size={14} className="text-sky-200" />
                            : <Check size={14} />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
