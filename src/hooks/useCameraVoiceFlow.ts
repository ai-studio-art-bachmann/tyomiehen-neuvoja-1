import { useState, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useSpeech } from './useSpeech';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from '@/hooks/use-toast';

interface CameraVoiceFlowState {
  step: 'idle' | 'camera' | 'captured' | 'processing' | 'playing' | 'prompt-play' | 'results';
  photoBlob: Blob | null;
  fileName: string;
  isOnline: boolean;
  audioUrl: string | null;
  analysisText: string | null;
}

export const useCameraVoiceFlow = (webhookUrl: string) => {
  const camera = useCamera();
  const speech = useSpeech();
  const offlineStorage = useOfflineStorage();
  
  const [state, setState] = useState<CameraVoiceFlowState>({
    step: 'idle',
    photoBlob: null,
    fileName: '',
    isOnline: navigator.onLine,
    audioUrl: null,
    analysisText: null,
  });

  const startFlow = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, step: 'camera' }));
      await camera.open();
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast({
        title: "Kamera ei käynnisty",
        description: "Tarkista kameran käyttöoikeudet",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, step: 'idle', audioUrl: null, analysisText: null }));
    }
  }, [camera]);

  const capturePhoto = useCallback(async () => {
    try {
      const blob = await camera.capture();
      
      setState(prev => ({ ...prev, step: 'captured', photoBlob: blob, analysisText: null }));
      camera.close();
      
      const fileName = `kuva_${Date.now()}`;
      setState(prev => ({ ...prev, fileName }));
      await processPhoto(blob, fileName, true);

    } catch (error) {
      console.error('Photo capture failed:', error);
      toast({
        title: "Kuvan otto epäonnistui",
        description: "Yritä uudelleen",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, step: 'camera' }));
    }
  }, [camera]);

  const processPhoto = useCallback(async (blob: Blob, fileName: string, wantAudio: boolean) => {
    setState(prev => ({ ...prev, step: 'processing' }));
    
    try {
      if (!navigator.onLine) {
        // Offline mode - save for later sync
        await offlineStorage.saveOffline(blob, fileName, wantAudio);
        await speech.speak("Kuva tallennettu offline-tilassa. Lähetetään kun verkko palaa.");
        toast({
          title: "Tallennettu offline-tilassa",
          description: "Kuva lähetetään kun verkko palaa"
        });
        resetFlow();
        return;
      }

      // Online mode - upload immediately
      const formData = new FormData();
      formData.append('file', blob, `${fileName}.jpg`);
      formData.append('filename', `${fileName}.jpg`);
      formData.append('wantAudio', wantAudio.toString());

      console.log('Uploading photo:', fileName, 'Want audio:', wantAudio);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);
      
      const text = data.textResponse || "Tekstivastetta ei saatu.";
      setState(prev => ({ ...prev, analysisText: text, step: 'results' }));

      if (wantAudio && data.audioResponse) {
        await playAudioResponse(data.audioResponse);
      }
    } catch (error) {
      console.error('Photo processing failed:', error);
      await speech.speak("Tallennus epäonnistui. Yritä uudelleen.");
      toast({
        title: "Käsittely epäonnistui",
        description: "Yritä uudelleen",
        variant: "destructive"
      });
      resetFlow();
    }
  }, [webhookUrl, offlineStorage, speech]);

  const playAudioResponse = useCallback(async (audioData: string): Promise<boolean> => {
    try {
      // Handle different audio data formats
      let audioUrl = audioData;
      
      if (audioData.startsWith('data:audio/')) {
        // Base64 data URI - use directly
        audioUrl = audioData;
      } else if (audioData.startsWith('blob:')) {
        // Blob URL - use directly
        audioUrl = audioData;
      } else {
        // Assume base64 string, convert to data URI
        audioUrl = `data:audio/mpeg;base64,${audioData}`;
      }
      
      const audio = new Audio(audioUrl);
      
      await audio.play();
      
      return new Promise<boolean>((resolve) => {
        audio.onended = () => resolve(true);
        audio.onerror = () => resolve(true); // Continue even if audio fails
      });

    } catch (autoplayError) {
      console.warn('Autoplay blocked, prompting user:', autoplayError);
      
      let audioUrl = audioData;
      if (!audioData.startsWith('data:') && !audioData.startsWith('blob:')) {
        audioUrl = `data:audio/mpeg;base64,${audioData}`;
      }

      setState(prev => ({ ...prev, step: 'prompt-play', audioUrl: audioUrl }));
      return false; // Indicate that playback was not successful
    }
  }, []);
  
  const playAudioFromUrl = useCallback(async () => {
    if (!state.audioUrl) return;
    try {
      setState(prev => ({ ...prev, step: 'playing' }));
      const audio = new Audio(state.audioUrl);
      await audio.play();

      audio.onended = () => {
        toast({
            title: "Analyysi valmis",
            description: "Toisto on päättynyt."
        });
        setState(prev => ({ ...prev, step: 'results' }));
      };
    } catch (error) {
      console.error('Manual audio playback failed:', error);
      toast({ title: "Toisto epäonnistui", variant: "destructive" });
      resetFlow();
    }
  }, [state.audioUrl]);

  const resetFlow = useCallback(() => {
    setState({
      step: 'idle',
      photoBlob: null,
      fileName: '',
      isOnline: navigator.onLine,
      audioUrl: null,
      analysisText: null,
    });
    camera.close();
  }, [camera]);

  return {
    ...state,
    videoRef: camera.videoRef,
    canvasRef: camera.canvasRef,
    startFlow,
    capturePhoto,
    resetFlow,
    playAudioFromUrl
  };
};
