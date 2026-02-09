'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import ConfirmDealModal from './ConfirmDealModal';
import { Property, PropertyStatus } from '@/types/industry';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
    };
    receiver: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

interface ChatInterfaceProps {
    propertyId: string;
    otherUserId: string;
    otherUserName: string;
    propertyTitle: string;
    property?: {
        _id: string;
        title: string;
        price: number;
        status?: PropertyStatus;
        owner?: { _id: string };
    };
}

export default function ChatInterface({ propertyId, otherUserId, otherUserName, propertyTitle, property }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Determine if current user is the owner
    const isOwner = user?.role === 'owner' && property?.owner?._id === user?._id;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch messages
    useEffect(() => {
        if (!propertyId || !otherUserId) return;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/chat/messages/${propertyId}/${otherUserId}`);
                setMessages(response.data.messages || []);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [propertyId, otherUserId]);

    // Socket.IO for real-time messages
    useEffect(() => {
        if (!propertyId || !user) return;

        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(SOCKET_URL, {
            query: { userId: user._id }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('join-conversation', { propertyId, userId: user._id });
        });

        socket.on('new-message', (message: Message) => {
            console.log('New message received:', message);
            // Only add if it's for this conversation
            if (message.sender._id === otherUserId || message.receiver._id === otherUserId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [propertyId, otherUserId, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const response = await api.post('/chat/messages', {
                propertyId,
                receiverId: otherUserId,
                content: newMessage.trim()
            });

            // Optimistically add message
            if (response.data.success) {
                setMessages((prev) => [...prev, response.data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{propertyTitle}</h3>
                        <p className="text-sm text-gray-500">{otherUserName}</p>
                    </div>
                    {isOwner && property && property.status !== 'rented' && property.status !== 'archived' && (
                        <button
                            onClick={() => setShowDealModal(true)}
                            className="px-4 py-2   bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            🎉 Confirm Deal
                        </button>
                    )}
                </div>
            </div>

            {/* Confirm Deal Modal */}
            {property && (
                <ConfirmDealModal
                    isOpen={showDealModal}
                    onClose={() => setShowDealModal(false)}
                    property={property as any}
                    tenant={{ _id: otherUserId, name: otherUserName, email: '' }}
                    onSuccess={() => window.location.reload()}
                />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                content={message.content}
                                isSent={message.sender._id === user?._id}
                                timestamp={message.createdAt}
                                senderName={message.sender._id !== user?._id ? message.sender.name : undefined}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Send</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
