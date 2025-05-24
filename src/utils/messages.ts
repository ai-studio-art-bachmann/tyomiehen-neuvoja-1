
import { ChatMessage } from '@/types/voice';

export class MessageManager {
  private messageIdCounter = 0;

  addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    this.messageIdCounter += 1;
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${this.messageIdCounter}-${Date.now()}`,
      timestamp: new Date()
    };
    return newMessage;
  };

  addSystemMessage = (content: string): ChatMessage => {
    return this.addMessage({
      type: 'system',
      content
    });
  };

  reset = () => {
    this.messageIdCounter = 0;
  };
}
