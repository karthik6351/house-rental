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
    };
    tenant: {
        _id: string;
        name: string;
        email: string;
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function OwnerMessagesPage() {
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
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chat/conversations');

            // Transform backend response to match frontend interface
            const transformedConversations = response.data.conversations.map((conv: any) => ({
                _id: `${conv.property._id}-${conv.tenant._id}`,
                property: conv.property,
                tenant: conv.tenant,
                lastMessage: conv.lastMessage,
                lastMessageTime: conv.lastMessageTime,
                unreadCount: conv.unreadCount
            }));

            setConversations(transformedConversations);
        } catch (error: any) {
            console.error('Failed to fetch conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (propertyId: string, userId: string) => {
        const conversation = conversations.find(
            (conv) => conv.property._id === propertyId && conv.tenant._id === userId
        );
        if (conversation) {
            setSelectedConversation({
                propertyId: conversation.property._id,
                userId: conversation.tenant._id,
                userName: conversation.tenant.name,
                propertyTitle: conversation.property.title
            });
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['owner']}>
                <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['owner']}>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-2.5 rounded-xl">
                                    <MessageCircle className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Messages</h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">Manage your conversations with tenants.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1C1C1F] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden flex flex-col md:flex-row h-[70vh] min-h-[500px] max-h-[800px]">
                        {/* Conversations List Sidebar */}
                        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800/60 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            <div className="bg-gray-50/50 dark:bg-[#121214]/50 px-6 py-5 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Inbox</h2>
                                <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full">{conversations.length}</span>
                            </div>
                            <div className="overflow-y-auto flex-1 scrollbar-hide">
                                <ConversationList
                                    conversations={conversations.map(conv => ({
                                        _id: conv._id,
                                        property: conv.property,
                                        otherUser: conv.tenant,
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
                        </div>

                        {/* Chat Interface Area */}
                        <div className={`flex-1 flex flex-col bg-gray-50/30 dark:bg-[#121214]/30 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {selectedConversation ? (
                                <ChatInterface
                                    propertyId={selectedConversation.propertyId}
                                    otherUserId={selectedConversation.userId}
                                    otherUserName={selectedConversation.userName}
                                    propertyTitle={selectedConversation.propertyTitle}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                        <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                        Select a conversation from the sidebar to view details and reply.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
