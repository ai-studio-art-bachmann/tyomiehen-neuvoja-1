
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
  
  const microphone = useMicrophone();
  const audioPlayer = useAudioPlayer();
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
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
      const formData = new FormData();
      formData.append('data0', audioBlob, 'speech.webm');

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is audio (mp3)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('audio')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
      } else {
        // Fallback to JSON response
        const data = await response.json();
        return data.answer || 'Vastausta ei saatu.';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Pyyntö keskeytetty');
      }
      console.error('Webhook error:', error);
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
      addSystemMessage('Kuuntelen...');

      // Wait for user to finish speaking (you might want to implement voice activity detection)
      // For now, we'll record for a fixed duration or until manually stopped
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds for demo

      // Stop recording
      setVoiceState(prev => ({ ...prev, status: 'sending' }));
      addSystemMessage('Lähetän...');
      
      const audioBlob = await microphone.stopRecording();
      
      // Add user message
      addMessage({
        type: 'user',
        content: 'Ääniviestin sisältö käsitellään...'
      });

      // Send to webhook
      setVoiceState(prev => ({ ...prev, status: 'waiting' }));
      addSystemMessage('Odotan vastausta...');

      const responseData = await sendAudioToWebhook(audioBlob);

      // Handle response
      setVoiceState(prev => ({ ...prev, status: 'playing', isPlaying: true }));
      addSystemMessage('Toistan vastauksen...');

      if (responseData.startsWith('blob:')) {
        // Audio response
        const assistantMessage = addMessage({
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
  }, [microphone, audioPlayer]);

  return {
    voiceState,
    messages,
    handleVoiceInteraction,
    reset,
    isDisabled: voiceState.status !== 'idle'
  };
};
