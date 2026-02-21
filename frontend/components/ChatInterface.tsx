'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api, { chatAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MoreVertical, Phone, User } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface Message {
    _id: string;
    sender: { _id: string; name: string };
    content: string;
    createdAt: string;
    read: boolean;
}

interface Participant {
    _id: string;
    name: string;
    email: string;
}

interface ChatInterfaceProps {
    conversationId?: string | null;
    propertyId?: string;
    otherUserId?: string;
    otherUserName?: string;
    propertyTitle?: string;
    onBack?: () => void;
    socket?: any;
    otherParticipant?: Participant | null;
}

export default function ChatInterface({ conversationId, propertyId, otherUserId, otherUserName, propertyTitle, onBack, socket, otherParticipant }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    useEffect(() => {
        if (socket && conversationId) {
            socket.emit('joinConversation', conversationId);

            const handleNewMessage = (message: Message) => {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            };

            socket.on('newMessage', handleNewMessage);

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.emit('leaveConversation', conversationId);
            };
        }
    }, [socket, conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const fetchMessages = async () => {
        if (!propertyId && !conversationId) return;
        setIsLoading(true);
        try {
            const response = propertyId && otherUserId
                ? await chatAPI.getMessages(propertyId, otherUserId)
                : await api.get(`/chat/messages/${conversationId}`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || isSending) return;

        setIsSending(true);
        try {
            const payload = propertyId && otherUserId
                ? { propertyId, receiverId: otherUserId, content: newMessage.trim() }
                : { conversationId, content: newMessage.trim() };
            const response = await chatAPI.sendMessage(payload);
            if (!socket) {
                setMessages(prev => [...prev, response.data.message]);
            }
            setNewMessage('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!conversationId) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-gray-400 -rotate-45" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Start a Conversation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Select a conversation from the list or reach out to a property owner.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-[#09090b]">
            {/* Chat Header */}
            <div className="bg-white dark:bg-[#131316] border-b border-gray-100 dark:border-gray-800/50 px-4 py-3 flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {otherParticipant?.name?.charAt(0).toUpperCase() || <User size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {otherParticipant?.name || 'Chat'}
                    </h3>
                    <p className="text-[11px] text-emerald-500 font-medium">Online</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading messages...
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message._id}
                            message={message}
                            isOwn={message.sender._id === user?._id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-[#131316] border-t border-gray-100 dark:border-gray-800/50 p-3 safe-area-bottom">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0f0f12] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="w-11 h-11 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                    >
                        <Send size={18} className="-rotate-45" />
                    </button>
                </form>
            </div>
        </div>
    );
}
