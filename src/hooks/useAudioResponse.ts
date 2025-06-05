
import { useState, useCallback } from 'react';

export const useAudioResponse = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudioResponse = useCallback(async (audioResponse: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setIsPlaying(true);
        
        // Käsittele base64-äänidata
        let audioData = audioResponse;
        
        // Poista mahdollinen data URL prefix
        if (audioData.startsWith('data:audio/')) {
          const base64Index = audioData.indexOf('base64,');
          if (base64Index !== -1) {
            audioData = audioData.substring(base64Index + 7);
          }
        }
        
        // Muunna base64 binääridataksi
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Luo audio blob
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Luo audio elementti ja toista
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          console.error('Äänen toisto epäonnistui:', error);
          reject(new Error('Äänen toisto epäonnistui'));
        };
        
        audio.oncanplaythrough = () => {
          audio.play().catch((playError) => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Äänen toiston aloitus epäonnistui'));
          });
        };
        
        // Lataa ääni
        audio.load();
        
      } catch (error) {
        setIsPlaying(false);
        console.error('Äänidata käsittely epäonnistui:', error);
        reject(new Error('Äänidata käsittely epäonnistui'));
      }
    });
  }, []);

  return {
    isPlaying,
    playAudioResponse
  };
};
