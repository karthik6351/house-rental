'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationList from '@/components/ConversationList';
import ChatInterface from '@/components/ChatInterface';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Conversation {
    _id: string;
    participants: { _id: string; name: string; email: string }[];
    property?: { _id: string; title: string };
    lastMessage?: { content: string; createdAt: string; sender: string };
    unreadCount?: number;
}

export default function TenantMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [otherParticipant, setOtherParticipant] = useState<{ _id: string; name: string; email: string } | null>(null);

    useEffect(() => {
        fetchConversations();

        const params = new URLSearchParams(window.location.search);
        const propertyId = params.get('propertyId');
        const ownerId = params.get('ownerId');
        if (propertyId && ownerId) {
            sessionStorage.setItem('pendingChat', JSON.stringify({ propertyId, ownerId }));
        }
    }, []);

    useEffect(() => {
        if (conversations.length > 0) {
            const pendingChat = sessionStorage.getItem('pendingChat');
            if (pendingChat) {
                try {
                    const { propertyId, ownerId } = JSON.parse(pendingChat);
                    const conv = conversations.find(c => {
                        const prop = (c as any).property;
                        return prop && prop._id === propertyId;
                    });
                    if (conv) {
                        handleSelectConversation(conv);
                    }
                    sessionStorage.removeItem('pendingChat');
                    window.history.replaceState({}, '', '/tenant/messages');
                } catch (e) { console.error(e); }
            }
        }
    }, [conversations]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chat/conversations');
            const raw = response.data.conversations || [];
            const mapped: Conversation[] = raw.map((conv: any) => ({
                _id: conv._id || `${conv.property?._id}-${conv.property?.owner?._id || ''}`,
                participants: [
                    { _id: user?._id || '', name: user?.name || '', email: user?.email || '' },
                    conv.property?.owner || { _id: '', name: 'Owner', email: '' },
                ],
                property: conv.property ? { _id: conv.property._id, title: conv.property.title } : undefined,
                lastMessage: conv.lastMessage ? { content: conv.lastMessage, createdAt: conv.lastMessageTime, sender: '' } : undefined,
                unreadCount: conv.unreadCount || 0,
            }));
            setConversations(mapped);
        } catch (error: any) {
            console.error('Failed to fetch conversations:', error);
            toast.error('Failed to load conversations');
        } finally { setLoading(false); }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConvId(conversation._id);
        const other = conversation.participants.find(p => p._id !== user?._id) || conversation.participants[0];
        setOtherParticipant(other);
    };

    return (
        <ProtectedRoute requiredRole="tenant">
            <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-10">
                <div className="bg-white dark:bg-[#131316] border-b border-gray-100 dark:border-gray-800/50 sticky top-16 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                            <MessageCircle size={22} className="text-primary-500" /> Messages
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Chat with property owners</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="card p-0 overflow-hidden flex flex-col md:flex-row h-[70vh] min-h-[500px] max-h-[800px] hover:translate-y-0 hover:shadow-sm">
                        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800/50 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-white">Inbox</h2>
                                <span className="badge badge-info text-[10px]">{conversations.length}</span>
                            </div>
                            <ConversationList
                                conversations={conversations}
                                activeConversation={activeConvId}
                                currentUserId={user?._id || ''}
                                onSelectConversation={handleSelectConversation}
                                isLoading={loading}
                            />
                        </div>

                        <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                            <ChatInterface
                                conversationId={activeConvId}
                                onBack={() => setActiveConvId(null)}
                                otherParticipant={otherParticipant}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
