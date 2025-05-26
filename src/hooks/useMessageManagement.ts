import { useCallback } from 'react';
import { ChatMessage, ConversationConfig } from '@/types/voice';
import { MessageManager } from '@/utils/messages';
import { getTranslations } from '@/utils/translations';

interface UseMessageManagementProps {
  addMessageToState: (message: ChatMessage) => void;
  messageManager: MessageManager;
  language: ConversationConfig['language'];
}

export const useMessageManagement = ({
  addMessageToState,
  messageManager,
  language,
}: UseMessageManagementProps) => {
  const t = getTranslations(language);

  const addSystemMessage = useCallback((content: string): ChatMessage => {
    const message = messageManager.addSystemMessage(content);
    addMessageToState(message);
    return message;
  }, [addMessageToState, messageManager]);

  const addUserMessage = useCallback((content: string): ChatMessage => {
    const message = messageManager.addMessage({
      type: 'user',
      content,
    } as Omit<ChatMessage, 'id' | 'timestamp'>);
    addMessageToState(message);
    return message;
  }, [addMessageToState, messageManager]);

  const addAssistantMessage = useCallback(
    (content: string, audioUrl?: string, fileUrl?: string, fileType?: string): ChatMessage => {
      const message = messageManager.addMessage({
        type: 'assistant',
        content,
        audioUrl,
        fileUrl,
        fileType,
      } as Omit<ChatMessage, 'id' | 'timestamp'>);
      addMessageToState(message);
      return message;
    },
    [addMessageToState, messageManager]
  );
  
  const addAssistantMessageWithDefaults = useCallback(
    (responseText: string | undefined, audioUrl?: string, fileUrl?: string, fileType?: string): ChatMessage => {
      const defaultContentForFile = fileUrl 
        ? (fileType?.startsWith('image/') ? t.imageReceived : t.fileReceived) 
        : ''; // No default content if no file
      
      // Use responseText if available, otherwise use defaultContentForFile if a file exists,
      // otherwise, if no text and no file, use a generic error message.
      const contentToDisplay = responseText || defaultContentForFile || t.unknownError;

      return addAssistantMessage(contentToDisplay, audioUrl, fileUrl, fileType);
    },
    [addAssistantMessage, t.imageReceived, t.fileReceived, t.unknownError]
  );

  return {
    addSystemMessage,
    addUserMessage,
    addAssistantMessage,
    addAssistantMessageWithDefaults,
  };
};
