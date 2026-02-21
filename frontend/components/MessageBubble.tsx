interface MessageBubbleProps {
    content: string;
    isSent: boolean;
    timestamp: string;
    senderName?: string;
}

export default function MessageBubble({ content, isSent, timestamp, senderName }: MessageBubbleProps) {
    return (
        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} w-full`}>
            {/* Added a max-width and structural container to prevent over-stretching */}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isSent ? 'items-end' : 'items-start'}`}>
                {!isSent && senderName && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">{senderName}</span>
                )}

                <div
                    className={`relative px-5 py-3 shadow-sm ${isSent
                            ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white dark:bg-[#1C1C1F] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm'
                        }`}
                >
                    <p className="text-sm md:text-[15px] whitespace-pre-wrap break-words leading-relaxed">{content}</p>
                </div>

                <span className={`text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1.5 mx-1`}>
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
