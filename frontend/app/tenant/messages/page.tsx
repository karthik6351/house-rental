'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import ConversationList from '@/components/ConversationList';
import ChatInterface from '@/components/ChatInterface';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Conversation {
    _id: string;
    property: {
        _id: string;
        title: string;
        images: string[];
        owner: {
            _id: string;
            name: string;
            email: string;
        };
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function TenantMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<{
        propertyId: string;
        userId: string;
        userName: string;
        propertyTitle: string;
    } | null>(null);

    useEffect(() => {
        fetchConversations();

        // Check for URL parameters (from Contact Owner button)
        const params = new URLSearchParams(window.location.search);
        const propertyId = params.get('propertyId');
        const ownerId = params.get('ownerId');

        if (propertyId && ownerId) {
            // Auto-select this conversation once conversations are loaded
            // We'll handle this in a separate useEffect after conversations load
            sessionStorage.setItem('pendingChat', JSON.stringify({ propertyId, ownerId }));
        }
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chat/conversations');
            setConversations(response.data.conversations);
        } catch (error: any) {
            console.error('Failed to fetch conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (propertyId: string, userId: string) => {
        const conversation = conversations.find((conv) => conv.property._id === propertyId);
        if (conversation) {
            setSelectedConversation({
                propertyId: conversation.property._id,
                userId: conversation.property.owner._id,
                userName: conversation.property.owner.name,
                propertyTitle: conversation.property.title
            });
        }
    };

    // Auto-select conversation from URL parameters after conversations load
    useEffect(() => {
        if (conversations.length > 0) {
            const pendingChat = sessionStorage.getItem('pendingChat');
            if (pendingChat) {
                try {
                    const { propertyId, ownerId } = JSON.parse(pendingChat);
                    handleSelectConversation(propertyId, ownerId);
                    sessionStorage.removeItem('pendingChat');

                    // Clear URL parameters
                    window.history.replaceState({}, '', '/tenant/messages');
                } catch (error) {
                    console.error('Failed to parse pending chat:', error);
                }
            }
        }
    }, [conversations]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['tenant']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['tenant']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3">
                            <MessageCircle className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                        </div>
                        <p className="text-gray-600 mt-2">Chat with property owners</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                            {/* Conversations List */}
                            <div className="border-r border-gray-200 overflow-y-auto">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h2 className="font-semibold text-gray-900">Conversations</h2>
                                    <p className="text-xs text-gray-500">{conversations.length} active</p>
                                </div>
                                <ConversationList
                                    conversations={conversations.map(conv => ({
                                        _id: conv._id,
                                        property: conv.property,
                                        otherUser: conv.property.owner,
                                        lastMessage: conv.lastMessage ? {
                                            content: conv.lastMessage,
                                            createdAt: conv.lastMessageTime
                                        } : undefined,
                                        unreadCount: conv.unreadCount
                                    }))}
                                    selectedPropertyId={selectedConversation?.propertyId || null}
                                    onSelectConversation={handleSelectConversation}
                                />
                            </div>

                            {/* Chat Interface */}
                            <div className="md:col-span-2">
                                {selectedConversation ? (
                                    <ChatInterface
                                        propertyId={selectedConversation.propertyId}
                                        otherUserId={selectedConversation.userId}
                                        otherUserName={selectedConversation.userName}
                                        propertyTitle={selectedConversation.propertyTitle}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MessageCircle className="w-20 h-20 mb-4" />
                                        <p className="text-lg font-medium">Select a conversation</p>
                                        <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
