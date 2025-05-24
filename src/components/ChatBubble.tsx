
import React from 'react';
import { ChatMessage } from '@/types/voice';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fi-FI', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.type === 'user';

  return (
    <div className={cn(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm',
        isUser 
          ? 'bg-gray-200 text-gray-800' 
          : 'bg-white border border-gray-200 text-gray-800'
      )}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {message.audioUrl && (
          <div className="mt-2">
            <audio 
              controls 
              className="w-full h-8"
              preload="none"
            >
              <source src={message.audioUrl} type="audio/mpeg" />
              Selaimesi ei tue äänitoistoa.
            </audio>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};
