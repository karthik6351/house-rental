import { Home, MessageCircle } from 'lucide-react';

interface Conversation {
    _id: string;
    property: {
        _id: string;
        title: string;
        images: string[];
    };
    otherUser: {
        _id: string;
        name: string;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    unreadCount: number;
}

interface ConversationListProps {
    conversations: Conversation[];
    selectedPropertyId: string | null;
    onSelectConversation: (propertyId: string, userId: string) => void;
}

export default function ConversationList({
    conversations,
    selectedPropertyId,
    onSelectConversation
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <MessageCircle className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm mt-2 text-center">
                    Start chatting about properties to see conversations here
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
                <div
                    key={conversation._id}
                    onClick={() => onSelectConversation(conversation.property._id, conversation.otherUser._id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${selectedPropertyId === conversation.property._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                >
                    <div className="flex items-start space-x-3">
                        {/* Property Image */}
                        <div className="flex-shrink-0">
                            {conversation.property.images && conversation.property.images.length > 0 ? (
                                <img
                                    src={conversation.property.images[0]}
                                    alt={conversation.property.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <Home className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {conversation.property.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conversation.otherUser.name}
                                    </p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                    <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                                        {conversation.unreadCount}
                                    </span>
                                )}
                            </div>
                            {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate mt-1">
                                    {conversation.lastMessage.content}
                                </p>
                            )}
                            {conversation.lastMessage && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(conversation.lastMessage.createdAt).toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
