
import React from 'react';
import { ChatMessage } from '@/types/voice';
import { cn } from '@/lib/utils';
import { File as FileIcon, Image as ImageIcon } from 'lucide-react'; // Kasutame lubatud ikoone

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

  const renderFileDisplay = () => {
    if (!message.fileUrl || !message.fileType) return null;

    // Define a consistent style for file links/previews
    const fileContainerClasses = "mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50";

    if (message.fileType.startsWith('image/')) { // Check for image MIME types e.g. image/png, image/jpeg
      return (
        <div className={`${fileContainerClasses} max-w-[200px] max-h-[200px] overflow-hidden`}>
          <img 
            src={message.fileUrl} 
            alt={message.content || 'Saadetud pilt'} 
            className="max-w-full max-h-full h-auto w-auto object-contain rounded"
          />
        </div>
      );
    } else { // For PDF, DOC, or other generic files
      const fileName = message.content || message.fileUrl.substring(message.fileUrl.lastIndexOf('/') + 1);
      return (
        <a 
          href={message.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${fileContainerClasses} flex items-center text-sm text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-colors duration-150`}
        >
          <FileIcon size={24} className="mr-3 flex-shrink-0 text-gray-500" />
          <span className="truncate" title={fileName}>{fileName.length > 30 ? `${fileName.substring(0, 27)}...` : fileName}</span>
        </a>
      );
    }
  };
  
  const hasTextContent = message.content && message.content.trim() !== '' && 
                         !(message.fileUrl && (message.content === (message.fileType?.startsWith('image/') ? 'Image received' : 'File received') || // Check against default messages if file exists
                                                message.content === (message.fileType?.startsWith('image/') ? 'Pilt vastu võetud' : 'Fail vastu võetud')));


  return (
    <div className={cn(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-sm flex flex-col', // Adjusted padding and made flex-col
        isUser 
          ? 'bg-blue-500 text-white' // User bubble style example
          : 'bg-white border border-gray-200 text-gray-800' // Assistant bubble style
      )}>
        {hasTextContent &&
          <p className="text-sm leading-relaxed mb-1">{message.content}</p>
        }
        
        {renderFileDisplay()} {/* Render file preview/link */}
        
        {message.audioUrl && (
          <div className="mt-2">
            <audio 
              controls 
              className="w-full h-8"
              preload="metadata" // Changed from none to metadata
            >
              <source src={message.audioUrl} type="audio/mpeg" />
              Selaimesi ei tue äänitoistoa.
            </audio>
          </div>
        )}
        
        <p className={cn(
          "text-xs mt-1 self-end", // Align time to end
           isUser ? 'text-blue-100' : 'text-gray-500'
           )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};
