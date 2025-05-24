
import { useState } from 'react';
import { VoiceState, ChatMessage } from '@/types/voice';

export const useConversationState = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    status: 'idle',
    isRecording: false,
    isPlaying: false,
    error: null
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isWaitingForClick, setIsWaitingForClick] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const reset = () => {
    setVoiceState({
      status: 'idle',
      isRecording: false,
      isPlaying: false,
      error: null
    });
    setMessages([]);
    setIsFirstInteraction(true);
    setIsWaitingForClick(false);
  };

  return {
    voiceState,
    setVoiceState,
    messages,
    setMessages,
    addMessage,
    isFirstInteraction,
    setIsFirstInteraction,
    isWaitingForClick,
    setIsWaitingForClick,
    reset
  };
};
