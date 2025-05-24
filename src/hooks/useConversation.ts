import { useCallback } from 'react';
import { ConversationConfig } from '@/types/voice';
import { useMicrophone } from './useMicrophone';
import { useAudioPlayer } from './useAudioPlayer';
import { useConversationState } from './useConversationState';
import { toast } from '@/hooks/use-toast';
import { MessageManager } from '@/utils/messages';
import { WebhookService } from '@/services/webhookService';

export const useConversation = (config: ConversationConfig) => {
  const state = useConversationState();
  const microphone = useMicrophone();
  const audioPlayer = useAudioPlayer();
  
  const messageManager = new MessageManager();
  const webhookService = new WebhookService();

  const addSystemMessage = useCallback((content: string) => {
    const message = messageManager.addSystemMessage(content);
    state.addMessage(message);
  }, [state]);

  const addUserMessage = useCallback((content: string) => {
    const message = messageManager.addMessage({
      type: 'user',
      content
    });
    state.addMessage(message);
    return message;
  }, [state]);

  const addAssistantMessage = useCallback((content: string, audioUrl?: string) => {
    const message = messageManager.addMessage({
      type: 'assistant',
      content,
      audioUrl
    });
    state.addMessage(message);
    return message;
  }, [state]);

  const stopRecordingAndSend = useCallback(async () => {
    try {
      state.setVoiceState(prev => ({ ...prev, status: 'sending', isRecording: false }));
      state.setIsWaitingForClick(false);
      addSystemMessage('Pysäytän nauhoituksen...');
      
      const audioBlob = await microphone.stopRecording();
      
      if (audioBlob.size === 0) {
        throw new Error('Äänitallennus epäonnistui - ei ääntä havaittu');
      }
      
      console.log('Audio recorded successfully, size:', audioBlob.size);
      
      addUserMessage('Ääniviestin sisältö käsitellään...');

      state.setVoiceState(prev => ({ ...prev, status: 'waiting' }));
      addSystemMessage('Lähetän palvelimelle...');

      const responseData = await webhookService.sendAudioToWebhook(audioBlob, config.webhookUrl);

      state.setVoiceState(prev => ({ ...prev, status: 'playing', isPlaying: true }));
      addSystemMessage('Käsittelen vastausta...');

      // Check if response contains both text and audio
      try {
        const parsedResponse = JSON.parse(responseData);
        if (parsedResponse.text && parsedResponse.audioUrl) {
          // We have both text and audio
          addAssistantMessage(parsedResponse.text, parsedResponse.audioUrl);
          addSystemMessage('Toistan äänivastauksen...');
          await audioPlayer.playAudio(parsedResponse.audioUrl);
        } else {
          // Only text response
          addAssistantMessage(parsedResponse.text || responseData);
        }
      } catch (e) {
        // Not JSON, treat as plain text or audio URL
        if (responseData.startsWith('blob:')) {
          addAssistantMessage('Äänivastaus', responseData);
          addSystemMessage('Toistan äänivastauksen...');
          await audioPlayer.playAudio(responseData);
        } else {
          addAssistantMessage(responseData);
        }
      }

      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: null
      });
      addSystemMessage('Valmis seuraavaan kysymykseen!');

    } catch (error) {
      console.error('Voice interaction error:', error);
      
      microphone.cleanup();
      
      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Tuntematon virhe'
      });

      toast({
        title: "Virhe äänikäskyssä",
        description: error instanceof Error ? error.message : "Yritä uudelleen",
        variant: "destructive"
      });

      addSystemMessage(`Virhe: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`);
    }
  }, [microphone, audioPlayer, config.webhookUrl, state, addSystemMessage, addUserMessage, addAssistantMessage]);

  const handleVoiceInteraction = useCallback(async () => {
    try {
      // If waiting for click to stop recording
      if (state.isWaitingForClick) {
        await stopRecordingAndSend();
        return;
      }

      // First interaction: try to play greeting
      if (state.isFirstInteraction) {
        state.setVoiceState(prev => ({ ...prev, status: 'greeting' }));
        addSystemMessage('Aloitan keskustelun...');
        
        try {
          await audioPlayer.playGreeting();
          addSystemMessage('Tervehdys toistettu!');
        } catch (error) {
          console.warn('Greeting audio failed, continuing without it:', error);
          addSystemMessage('Valmis kuuntelemaan!');
        }
        
        state.setIsFirstInteraction(false);
      }

      // Start recording
      state.setVoiceState(prev => ({ ...prev, status: 'recording', isRecording: true }));
      state.setIsWaitingForClick(true);
      addSystemMessage('Alusta puhuminen...');
      
      await microphone.startRecording();
      addSystemMessage('Kuuntelen... Kliki uuesti kui oled valmis!');

      // No automatic timeout - user controls when to send

    } catch (error) {
      console.error('Voice interaction error:', error);
      
      microphone.cleanup();
      
      state.setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Tuntematon virhe'
      });
      state.setIsWaitingForClick(false);

      toast({
        title: "Virhe äänikäskyssä",
        description: error instanceof Error ? error.message : "Yritä uudelleen",
        variant: "destructive"
      });

      addSystemMessage(`Virhe: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`);
    }
  }, [state, microphone, audioPlayer, stopRecordingAndSend, addSystemMessage]);

  const reset = useCallback(() => {
    microphone.cleanup();
    audioPlayer.stopAudio();
    webhookService.cleanup();
    state.reset();
    messageManager.reset();
  }, [microphone, audioPlayer, state]);

  return {
    voiceState: state.voiceState,
    messages: state.messages,
    handleVoiceInteraction,
    reset,
    isDisabled: state.voiceState.status !== 'idle' && !state.isWaitingForClick,
    isWaitingForClick: state.isWaitingForClick
  };
};
