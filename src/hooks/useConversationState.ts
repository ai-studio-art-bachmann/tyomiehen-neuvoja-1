
import { useState, useRef } from 'react';
import { VoiceState, ChatMessage } from '@/types/voice';

export const useConversationState = () => {
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const setRecordingTimeout = (callback: () => void, delay: number) => {
    recordingTimeoutRef.current = setTimeout(callback, delay);
  };

  const reset = () => {
    clearRecordingTimeout();
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
    recordingTimeoutRef,
    clearRecordingTimeout,
    setRecordingTimeout,
    reset
  };
};
