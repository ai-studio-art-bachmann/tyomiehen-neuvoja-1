
import { useCallback, useMemo } from 'react'; // Correctly import useMemo
import { ConversationConfig } from '@/types/voice';
import { useMicrophone } from './useMicrophone';
import { useAudioPlayer } from './useAudioPlayer';
import { useConversationState } from './useConversationState';
import { MessageManager } from '@/utils/messages';
import { WebhookService } from '@/services/webhookService';

// New imports
import { useMessageManagement } from './useMessageManagement';
import { useVoiceHandler } from './useVoiceHandler';

export const useConversation = (config: ConversationConfig) => {
  const conversationState = useConversationState();
  const microphone = useMicrophone();
  const audioPlayer = useAudioPlayer();
  
  const messageManager = useMemo(() => new MessageManager(), []);
  const webhookService = useMemo(() => new WebhookService(), []);

  const { 
    addSystemMessage, 
    addUserMessage, 
    addAssistantMessage, 
    addAssistantMessageWithDefaults 
  } = useMessageManagement({
    addMessageToState: conversationState.addMessage,
    messageManager,
    language: config.language,
  });
  
  const { handleVoiceInteraction } = useVoiceHandler({
    config,
    conversationState,
    microphone,
    audioPlayer,
    webhookService,
    messageAdders: { addSystemMessage, addUserMessage, addAssistantMessage, addAssistantMessageWithDefaults },
  });

  const reset = useCallback(() => {
    microphone.cleanup();
    audioPlayer.stopAudio();
    webhookService.cleanup();
    conversationState.reset();
    messageManager.reset();
  }, [microphone, audioPlayer, webhookService, conversationState, messageManager]);

  return {
    voiceState: conversationState.voiceState,
    messages: conversationState.messages,
    handleVoiceInteraction,
    reset,
    isDisabled: conversationState.voiceState.status !== 'idle' && !conversationState.isWaitingForClick,
    isWaitingForClick: conversationState.isWaitingForClick,
  };
};
