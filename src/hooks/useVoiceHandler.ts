
import { useCallback } from 'react';
import { ConversationConfig } from '@/types/voice';
import { useMicrophone } from './useMicrophone';
import { useAudioPlayer } from './useAudioPlayer';
import { useConversationState } from './useConversationState';
import { toast } from '@/hooks/use-toast';
import { WebhookService } from '@/services/webhookService';
import { getTranslations } from '@/utils/translations';
import { ChatMessage } from '@/types/voice'; // For MessageAdders return types

// Types for the message functions expected from useMessageManagement
interface MessageAdders {
  addSystemMessage: (content: string) => ChatMessage;
  addUserMessage: (content: string) => ChatMessage;
  addAssistantMessage: (content: string, audioUrl?: string, fileUrl?: string, fileType?: string) => ChatMessage;
  addAssistantMessageWithDefaults: (responseText: string | undefined, audioUrl?: string, fileUrl?: string, fileType?: string) => ChatMessage;
}

interface UseVoiceHandlerProps {
  config: ConversationConfig;
  conversationState: ReturnType<typeof useConversationState>;
  microphone: ReturnType<typeof useMicrophone>;
  audioPlayer: ReturnType<typeof useAudioPlayer>;
  webhookService: WebhookService;
  messageAdders: MessageAdders;
}

export const useVoiceHandler = ({
  config,
  conversationState,
  microphone,
  audioPlayer,
  webhookService,
  messageAdders,
}: UseVoiceHandlerProps) => {
  const t = getTranslations(config.language);
  const { 
    setVoiceState, 
    setIsWaitingForClick, 
    isWaitingForClick, 
    isFirstInteraction, 
    setIsFirstInteraction 
  } = conversationState;
  const { 
    addSystemMessage, 
    addUserMessage, 
    addAssistantMessage, // Keep for direct fallback if needed
    addAssistantMessageWithDefaults 
  } = messageAdders;

  const stopRecordingAndSend = useCallback(async () => {
    try {
      audioPlayer.stopAudio();
      
      setVoiceState(prev => ({ ...prev, status: 'sending', isRecording: false }));
      setIsWaitingForClick(false);
      addSystemMessage(t.stopRecording);
      
      const audioBlob = await microphone.stopRecording();
      
      if (audioBlob.size === 0) {
        throw new Error(t.recordingFailed);
      }
      
      console.log('Audio recorded successfully, size:', audioBlob.size);
      
      addUserMessage(t.processingAudio);

      setVoiceState(prev => ({ ...prev, status: 'waiting' }));
      addSystemMessage(t.sendingToServer);

      const responseDataString = await webhookService.sendAudioToWebhook(audioBlob, config.webhookUrl);

      setVoiceState(prev => ({ ...prev, status: 'playing', isPlaying: true }));
      addSystemMessage(t.processingResponse);

      try {
        const parsedResponse = JSON.parse(responseDataString);
        addAssistantMessageWithDefaults(
            parsedResponse.text,
            parsedResponse.audioUrl,
            parsedResponse.fileUrl,
            parsedResponse.fileType
        );
        if (parsedResponse.audioUrl) {
            addSystemMessage(t.playingAudio);
            await audioPlayer.playAudio(parsedResponse.audioUrl);
        }
      } catch (e) {
        console.error("Error parsing webhook response or non-JSON response:", e, responseDataString);
        if (responseDataString.startsWith('blob:')) {
          addAssistantMessage('Äänivastaus', responseDataString);
          addSystemMessage(t.playingAudio);
          await audioPlayer.playAudio(responseDataString);
        } else {
          addAssistantMessage(responseDataString || t.unknownError);
        }
      }

      setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: null
      });
      addSystemMessage(t.readyForNext);

    } catch (error) {
      console.error('Voice interaction error in stopRecordingAndSend:', error);
      microphone.cleanup();
      setVoiceState({
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
  }, [
    microphone, audioPlayer, config.webhookUrl, setVoiceState, setIsWaitingForClick, 
    addSystemMessage, addUserMessage, addAssistantMessage, addAssistantMessageWithDefaults,
    t, webhookService
  ]);

  const handleVoiceInteraction = useCallback(async () => {
    try {
      audioPlayer.stopAudio();
      
      if (isWaitingForClick) {
        await stopRecordingAndSend();
        return;
      }

      if (isFirstInteraction) {
        setVoiceState(prev => ({ ...prev, status: 'greeting' }));
        addSystemMessage(t.startConversationPrompt);
        
        try {
          await audioPlayer.playGreeting();
          addSystemMessage(t.greetingPlayed);
        } catch (error) {
          console.warn('Greeting audio failed, continuing without it:', error);
          addSystemMessage(t.readyToListen);
        }
        
        setIsFirstInteraction(false);
      }

      setVoiceState(prev => ({ ...prev, status: 'recording', isRecording: true }));
      setIsWaitingForClick(true);
      addSystemMessage(t.startRecording);
      
      await microphone.startRecording();
      addSystemMessage(t.listeningClickWhenReady);

    } catch (error) {
      console.error('Voice interaction error in handleVoiceInteraction:', error);
      microphone.cleanup();
      setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : t.unknownError
      });
      setIsWaitingForClick(false);
      toast({
        title: t.voiceError,
        description: error instanceof Error ? error.message : t.tryAgain,
        variant: "destructive"
      });
      addSystemMessage(`${t.voiceError}: ${error instanceof Error ? error.message : t.unknownError}`);
    }
  }, [
    isWaitingForClick, isFirstInteraction, 
    microphone, audioPlayer, stopRecordingAndSend, 
    setVoiceState, setIsWaitingForClick, setIsFirstInteraction, 
    addSystemMessage, t
  ]);

  return {
    handleVoiceInteraction,
  };
};
