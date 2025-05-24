
import { useState, useCallback, useRef } from 'react';
import { ChatMessage, VoiceState, ConversationConfig } from '@/types/voice';
import { useMicrophone } from './useMicrophone';
import { useAudioPlayer } from './useAudioPlayer';
import { toast } from '@/hooks/use-toast';

export const useConversation = (config: ConversationConfig) => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    status: 'idle',
    isRecording: false,
    isPlaying: false,
    error: null
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const messageIdCounter = useRef(0);
  
  const microphone = useMicrophone();
  const audioPlayer = useAudioPlayer();
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageIdCounter.current += 1;
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${messageIdCounter.current}-${Date.now()}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    addMessage({
      type: 'system',
      content
    });
  }, [addMessage]);

  const sendAudioToWebhook = useCallback(async (audioBlob: Blob): Promise<string> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      console.log('Sending audio to webhook:', config.webhookUrl);
      console.log('Audio blob size:', audioBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('data0', audioBlob, 'speech.webm');

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'audio/mpeg,application/json,*/*'
        }
      });

      console.log('Webhook response status:', response.status);
      console.log('Webhook response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Palvelin vastasi virheellä: ${response.status} ${response.statusText}`);
      }

      // Check if response is audio (mp3)
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (contentType && contentType.includes('audio')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Received audio response, created URL:', audioUrl);
        return audioUrl;
      } else {
        // Fallback to JSON response
        const data = await response.json();
        console.log('Received JSON response:', data);
        return data.answer || data.response || 'Vastausta ei saatu.';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Pyyntö keskeytetty');
      }
      console.error('Webhook error:', error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Verkkoyhteydessä on ongelma. Tarkista internetyhteys.');
      }
      
      throw new Error('Palvelinyhteys epäonnistui');
    }
  }, [config.webhookUrl]);

  const handleVoiceInteraction = useCallback(async () => {
    try {
      // First interaction: try to play greeting, but continue even if it fails
      if (isFirstInteraction) {
        setVoiceState(prev => ({ ...prev, status: 'greeting' }));
        addSystemMessage('Aloitan keskustelun...');
        
        try {
          await audioPlayer.playGreeting();
          addSystemMessage('Tervehdys toistettu!');
        } catch (error) {
          console.warn('Greeting audio failed, continuing without it:', error);
          addSystemMessage('Valmis kuuntelemaan!');
        }
        
        setIsFirstInteraction(false);
      }

      // Start recording
      setVoiceState(prev => ({ ...prev, status: 'recording', isRecording: true }));
      addSystemMessage('Alusta puhuminen...');
      
      await microphone.startRecording();
      addSystemMessage('Kuuntelen... (puhu 5 sekunnin ajan)');

      // Record for 5 seconds instead of 3
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Stop recording
      setVoiceState(prev => ({ ...prev, status: 'sending', isRecording: false }));
      addSystemMessage('Pysäytän nauhoituksen...');
      
      const audioBlob = await microphone.stopRecording();
      
      if (audioBlob.size === 0) {
        throw new Error('Äänitallennus epäonnistui - ei ääntä havaittu');
      }
      
      console.log('Audio recorded successfully, size:', audioBlob.size);
      
      // Add user message
      addMessage({
        type: 'user',
        content: 'Ääniviestin sisältö käsitellään...'
      });

      // Send to webhook
      setVoiceState(prev => ({ ...prev, status: 'waiting' }));
      addSystemMessage('Lähetän palvelimelle...');

      const responseData = await sendAudioToWebhook(audioBlob);

      // Handle response
      setVoiceState(prev => ({ ...prev, status: 'playing', isPlaying: true }));
      addSystemMessage('Toistan vastauksen...');

      if (responseData.startsWith('blob:')) {
        // Audio response
        addMessage({
          type: 'assistant',
          content: 'Äänivastaus',
          audioUrl: responseData
        });

        await audioPlayer.playAudio(responseData);
      } else {
        // Text response
        addMessage({
          type: 'assistant',
          content: responseData
        });
      }

      // Return to idle
      setVoiceState({
        status: 'idle',
        isRecording: false,
        isPlaying: false,
        error: null
      });
      addSystemMessage('Valmis seuraavaan kysymykseen!');

    } catch (error) {
      console.error('Voice interaction error:', error);
      
      // Cleanup microphone if it's still recording
      microphone.cleanup();
      
      setVoiceState({
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
  }, [isFirstInteraction, microphone, audioPlayer, sendAudioToWebhook, addMessage, addSystemMessage]);

  const reset = useCallback(() => {
    microphone.cleanup();
    audioPlayer.stopAudio();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setVoiceState({
      status: 'idle',
      isRecording: false,
      isPlaying: false,
      error: null
    });
    setMessages([]);
    setIsFirstInteraction(true);
    messageIdCounter.current = 0;
  }, [microphone, audioPlayer]);

  return {
    voiceState,
    messages,
    handleVoiceInteraction,
    reset,
    isDisabled: voiceState.status !== 'idle'
  };
};
