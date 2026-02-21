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
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">No conversations yet</p>
                <p className="text-sm mt-2 text-center max-w-[200px]">
                    Start chatting about properties to see them here.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {conversations.map((conversation) => (
                <div
                    key={conversation._id}
                    onClick={() => onSelectConversation(conversation.property._id, conversation.otherUser._id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#121214] relative ${selectedPropertyId === conversation.property._id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                >
                    {/* Active Indicator */}
                    {selectedPropertyId === conversation.property._id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 dark:bg-primary-500 rounded-r-full"></div>
                    )}

                    <div className="flex items-start space-x-3">
                        {/* Property Image */}
                        <div className="flex-shrink-0 relative">
                            {conversation.property.images && conversation.property.images.length > 0 ? (
                                <img
                                    src={conversation.property.images[0]}
                                    alt={conversation.property.title}
                                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                    <Home className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            {/* Online Badge Placeholder (Optional) */}
                            {/* <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#1C1C1F] rounded-full"></div> */}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {conversation.property.title}
                                    </p>
                                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 truncate mt-0.5">
                                        {conversation.otherUser.name}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {conversation.lastMessage && (
                                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}
                                    {conversation.unreadCount > 0 && (
                                        <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-primary-600 rounded-full shadow-sm shadow-primary-500/30">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {conversation.lastMessage && (
                                <p className={`text-sm truncate mt-1 ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {conversation.lastMessage.content}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
