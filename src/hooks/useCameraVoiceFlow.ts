
import { useState, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useSpeech } from './useSpeech';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from '@/hooks/use-toast';

interface CameraVoiceFlowState {
  step: 'idle' | 'camera' | 'captured' | 'asking-name' | 'listening' | 'asking-choice' | 'processing' | 'playing';
  photoBlob: Blob | null;
  fileName: string;
  isOnline: boolean;
}

export const useCameraVoiceFlow = (webhookUrl: string) => {
  const camera = useCamera();
  const speech = useSpeech();
  const offlineStorage = useOfflineStorage();
  
  const [state, setState] = useState<CameraVoiceFlowState>({
    step: 'idle',
    photoBlob: null,
    fileName: '',
    isOnline: navigator.onLine
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
      setState(prev => ({ ...prev, step: 'idle' }));
    }
  }, [camera]);

  const capturePhoto = useCallback(async () => {
    try {
      const blob = camera.capture();
      if (!blob) throw new Error('Capture failed');
      
      setState(prev => ({ ...prev, step: 'captured', photoBlob: blob }));
      camera.close();
      
      // Ask for filename
      setTimeout(async () => {
        try {
          setState(prev => ({ ...prev, step: 'asking-name' }));
          const fileName = await speech.ask("Anna tiedostolle nimi");
          setState(prev => ({ ...prev, fileName, step: 'asking-choice' }));
          
          // Ask if user wants to hear analysis now
          const choice = await speech.ask("Haluatko kuulla analyysin nyt? Sano kyllä tai ei");
          const wantAudio = choice.toLowerCase().includes('kyllä') || choice.toLowerCase().includes('joo');
          
          await processPhoto(blob, fileName, wantAudio);
        } catch (error) {
          console.error('Voice interaction failed:', error);
          await speech.speak("Yritetään uudelleen");
          setState(prev => ({ ...prev, step: 'captured' }));
        }
      }, 100);
    } catch (error) {
      console.error('Photo capture failed:', error);
      toast({
        title: "Kuvan otto epäonnistui",
        description: "Yritä uudelleen",
        variant: "destructive"
      });
    }
  }, [camera, speech]);

  const processPhoto = useCallback(async (blob: Blob, fileName: string, wantAudio: boolean) => {
    setState(prev => ({ ...prev, step: 'processing' }));
    
    try {
      if (!navigator.onLine) {
        // Offline mode - save for later sync
        await offlineStorage.saveOffline(blob, fileName, wantAudio);
        await speech.speak("Tallennus epäonnistui verkkoyhteydenpuutteen vuoksi. Tiedosto tallennetaan kun yhteys palaa.");
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

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (wantAudio && data.audioResponse) {
        setState(prev => ({ ...prev, step: 'playing' }));
        await playAudioResponse(data.audioResponse);
      }

      await speech.speak("Analyysi valmis ja tallennettu");
      toast({
        title: "Kuva käsitelty",
        description: `${fileName}.jpg analysoitu ja tallennettu`
      });
      
      resetFlow();
    } catch (error) {
      console.error('Photo processing failed:', error);
      await speech.speak("Tallennus epäonnistui");
      toast({
        title: "Käsittely epäonnistui",
        description: "Yritä uudelleen",
        variant: "destructive"
      });
      resetFlow();
    }
  }, [webhookUrl, offlineStorage, speech]);

  const playAudioResponse = useCallback(async (audioData: string) => {
    try {
      // Decode audio response (assuming it's a data URI)
      const audio = new Audio(audioData);
      
      try {
        await audio.play();
      } catch (autoplayError) {
        console.warn('Autoplay blocked, user interaction required');
        // In a real implementation, show a play button here
        toast({
          title: "Paina kuunnellaksesi",
          description: "Analyysi on valmis toistettavaksi"
        });
      }
      
      return new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve(); // Continue even if audio fails
      });
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  }, []);

  const resetFlow = useCallback(() => {
    setState({
      step: 'idle',
      photoBlob: null,
      fileName: '',
      isOnline: navigator.onLine
    });
    camera.close();
  }, [camera]);

  return {
    ...state,
    videoRef: camera.videoRef,
    canvasRef: camera.canvasRef,
    startFlow,
    capturePhoto,
    resetFlow
  };
};
