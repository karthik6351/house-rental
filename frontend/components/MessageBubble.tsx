interface MessageBubbleProps {
    content: string;
    isSent: boolean;
    timestamp: string;
    senderName?: string;
}

export default function MessageBubble({ content, isSent, timestamp, senderName }: MessageBubbleProps) {
    return (
        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                {!isSent && senderName && (
                    <p className="text-sm text-gray-500 mb-1 px-1">{senderName}</p>
                )}
                <div
                    className={`rounded-lg px-4 py-2 ${isSent
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 px-1 ${isSent ? 'text-right' : 'text-left'}`}>
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}
