'use client';

import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Conversation {
    _id: string;
    participants: { _id: string; name: string; email: string }[];
    property?: { _id: string; title: string };
    lastMessage?: { content: string; createdAt: string; sender: string };
    unreadCount?: number;
}

interface ConversationListProps {
    conversations: Conversation[];
    activeConversation: string | null;
    currentUserId: string;
    onSelectConversation: (conversation: Conversation) => void;
    isLoading?: boolean;
}

export default function ConversationList({
    conversations,
    activeConversation,
    currentUserId,
    onSelectConversation,
    isLoading,
}: ConversationListProps) {
    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p._id !== currentUserId) || conversation.participants[0];
    };

    const getTimeDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);
        if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (hours < 168) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                        <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-24" />
                            <div className="skeleton h-3 w-40" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">No conversations</p>
                    <p className="text-xs text-gray-500">Start chatting with property owners or tenants</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto flex-1">
            <div className="p-2 space-y-0.5">
                {conversations.map((conversation) => {
                    const other = getOtherParticipant(conversation);
                    const isActive = activeConversation === conversation._id;

                    return (
                        <motion.button
                            key={conversation._id}
                            onClick={() => onSelectConversation(conversation)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/15 border border-primary-200/50 dark:border-primary-800/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                                }`}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                                    {other.name.charAt(0).toUpperCase()}
                                </div>
                                {/* Online indicator */}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#131316]" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={`text-sm truncate ${isActive ? 'text-primary-700 dark:text-primary-300 font-bold' : 'text-gray-900 dark:text-white font-semibold'}`}>
                                        {other.name}
                                    </h4>
                                    {conversation.lastMessage && (
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                            {getTimeDisplay(conversation.lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                {conversation.property && (
                                    <p className="text-[10px] text-primary-600/70 dark:text-primary-400/70 font-medium truncate">
                                        {conversation.property.title}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {conversation.lastMessage?.content || 'Start a conversation'}
                                </p>
                            </div>

                            {/* Unread */}
                            {(conversation.unreadCount || 0) > 0 && (
                                <div className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                    {conversation.unreadCount}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
