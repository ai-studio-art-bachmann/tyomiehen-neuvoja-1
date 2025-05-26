import { useCallback } from 'react';
import { ConversationConfig, ChatMessage } from '@/types/voice';
import { useMicrophone } from './useMicrophone';
import { useAudioPlayer } from './useAudioPlayer';
import { useConversationState } from './useConversationState';
import { toast } from '@/hooks/use-toast';
import { MessageManager } from '@/utils/messages';
import { WebhookService } from '@/services/webhookService';
import { getTranslations } from '@/utils/translations';

export const useConversation = (config: ConversationConfig) => {
  const state = useConversationState();
  const microphone = useMicrophone();
  const audioPlayer = useAudioPlayer();
  const t = getTranslations(config.language);
  
  // Initialize MessageManager instance within the hook or pass as dependency if created outside
  const messageManager = React.useMemo(() => new MessageManager(), []); // Ensure stable instance
  const webhookService = React.useMemo(() => new WebhookService(), []); // Ensure stable instance

  const addSystemMessage = useCallback((content: string) => {
    const message = messageManager.addSystemMessage(content);
    state.addMessage(message);
  }, [state, messageManager]);

  const addUserMessage = useCallback((content: string) => {
    const message = messageManager.addMessage({
      type: 'user',
      content
    } as Omit<ChatMessage, 'id' | 'timestamp'>); // Ensure correct type for messageManager
    state.addMessage(message);
    return message;
  }, [state, messageManager]);

  const addAssistantMessage = useCallback((content: string, audioUrl?: string, fileUrl?: string, fileType?: string) => {
    const message = messageManager.addMessage({
      type: 'assistant',
      content,
      audioUrl,
      fileUrl,
      fileType
    } as Omit<ChatMessage, 'id' | 'timestamp'>); // Ensure correct type
    state.addMessage(message);
    return message;
  }, [state, messageManager]);

  const stopRecordingAndSend = useCallback(async () => {
    try {
      audioPlayer.stopAudio();
      
      state.setVoiceState(prev => ({ ...prev, status: 'sending', isRecording: false }));
      state.setIsWaitingForClick(false);
      addSystemMessage(t.stopRecording);
      
      const audioBlob = await microphone.stopRecording();
      
      if (audioBlob.size === 0) {
        throw new Error(t.recordingFailed);
      }
      
      console.log('Audio recorded successfully, size:', audioBlob.size);
      
      addUserMessage(t.processingAudio);

      state.setVoiceState(prev => ({ ...prev, status: 'waiting' }));
      addSystemMessage(t.sendingToServer);

      const responseDataString = await webhookService.sendAudioToWebhook(audioBlob, config.webhookUrl);

      state.setVoiceState(prev => ({ ...prev, status: 'playing', isPlaying: true }));
      addSystemMessage(t.processingResponse);

      try {
        const parsedResponse = JSON.parse(responseDataString);
        if (parsedResponse.text || parsedResponse.fileUrl) { // If there's text OR a file, process it
          addAssistantMessage(
            parsedResponse.text || (parsedResponse.fileType === 'image' ? t.imageReceived || 'Image received' : t.fileReceived || 'File received'), // Provide default content if text is missing but file exists
            parsedResponse.audioUrl,
            parsedResponse.fileUrl,
            parsedResponse.fileType
          );
          if (parsedResponse.audioUrl) {
            addSystemMessage(t.playingAudio);
            await audioPlayer.playAudio(parsedResponse.audioUrl);
          }
        } else {
          // Fallback if responseDataString is not JSON or doesn't have expected structure
          // This should ideally not happen if webhookService always returns stringified JSON
          addAssistantMessage(responseDataString);
        }
      } catch (e) {
        console.error("Error parsing webhook response or non-JSON response:", e, responseDataString);
        // If responseDataString itself is a blob URL (legacy for pure audio)
        if (responseDataString.startsWith('blob:')) {
          addAssistantMessage('Äänivastaus', responseDataString);
          addSystemMessage(t.playingAudio);
          await audioPlayer.playAudio(responseDataString);
        } else {
          // Treat as plain text if not parsable and not a blob
          addAssistantMessage(responseDataString || t.unknownError);
        }
      }

      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: null
      });
      addSystemMessage(t.readyForNext);

    } catch (error) {
      console.error('Voice interaction error:', error);
      
      microphone.cleanup();
      
      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : t.unknownError
      });

      toast({
        title: t.voiceError,
        description: error instanceof Error ? error.message : t.tryAgain,
        variant: "destructive"
      });

      addSystemMessage(`${t.voiceError}: ${error instanceof Error ? error.message : t.unknownError}`);
    }
  }, [microphone, audioPlayer, config.webhookUrl, state, addSystemMessage, addUserMessage, addAssistantMessage, t, webhookService, messageManager]);

  const handleVoiceInteraction = useCallback(async () => {
    try {
      audioPlayer.stopAudio();
      
      if (state.isWaitingForClick) {
        await stopRecordingAndSend();
        return;
      }

      if (state.isFirstInteraction) {
        state.setVoiceState(prev => ({ ...prev, status: 'greeting' }));
        addSystemMessage(t.startConversationPrompt);
        
        try {
          await audioPlayer.playGreeting();
          addSystemMessage(t.greetingPlayed);
        } catch (error) {
          console.warn('Greeting audio failed, continuing without it:', error);
          addSystemMessage(t.readyToListen);
        }
        
        state.setIsFirstInteraction(false);
      }

      state.setVoiceState(prev => ({ ...prev, status: 'recording', isRecording: true }));
      state.setIsWaitingForClick(true);
      addSystemMessage(t.startRecording);
      
      await microphone.startRecording();
      addSystemMessage(t.listeningClickWhenReady);

    } catch (error) {
      console.error('Voice interaction error:', error);
      
      microphone.cleanup();
      
      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : t.unknownError
      });
      state.setIsWaitingForClick(false);

      toast({
        title: t.voiceError,
        description: error instanceof Error ? error.message : t.tryAgain,
        variant: "destructive"
      });

      addSystemMessage(`${t.voiceError}: ${error instanceof Error ? error.message : t.unknownError}`);
    }
  }, [state, microphone, audioPlayer, stopRecordingAndSend, addSystemMessage, t]);

  const reset = useCallback(() => {
    microphone.cleanup();
    audioPlayer.stopAudio();
    webhookService.cleanup(); // Assuming webhookService has a cleanup
    state.reset();
    messageManager.reset(); // Assuming messageManager has a reset
  }, [microphone, audioPlayer, state, webhookService, messageManager]);

  return {
    voiceState: state.voiceState,
    messages: state.messages,
    handleVoiceInteraction,
    reset,
    isDisabled: state.voiceState.status !== 'idle' && !state.isWaitingForClick,
    isWaitingForClick: state.isWaitingForClick
  };
};
