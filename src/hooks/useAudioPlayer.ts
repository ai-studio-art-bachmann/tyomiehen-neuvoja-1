
import { useState, useRef, useCallback } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Force garbage collection by removing src
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentAudio(null);
  }, []);

  const playAudio = useCallback(async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Always stop any currently playing audio first
      stopAudio();

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setCurrentAudio(audioUrl);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        resolve();
      };

      audio.onerror = (error) => {
        setIsPlaying(false);
        setCurrentAudio(null);
        console.error('Audio playback error:', error);
        reject(new Error('Audio toisaminen epäonnistui'));
      };

      audio.oncanplaythrough = () => {
        audio.play().catch((playError) => {
          setIsPlaying(false);
          setCurrentAudio(null);
          reject(new Error('Audio toiston aloitus epäonnistui'));
        });
      };

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (audio.readyState === 0) {
          setIsPlaying(false);
          setCurrentAudio(null);
          reject(new Error('Audio lataaminen aikakatkaistiin'));
        }
      }, 5000);

      // Preload the audio
      audio.load();
    });
  }, [stopAudio]);

  const playGreeting = useCallback(async (): Promise<void> => {
    try {
      await playAudio('/female-greeting.mp3');
    } catch (error) {
      console.warn('Greeting audio failed:', error);
      // Don't throw error, just log it
      throw new Error('Tervehdysääni ei ole saatavilla');
    }
  }, [playAudio]);

  return {
    isPlaying,
    currentAudio,
    playAudio,
    playGreeting,
    stopAudio
  };
};
