
import { useCallback } from 'react';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeech = () => {
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fi-FI';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      speechSynthesis.speak(utterance);
    });
  }, []);

  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fi-FI';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        resolve(result);
      };
      
      recognition.onerror = (error: any) => {
        reject(new Error(`Speech recognition error: ${error.error}`));
      };
      
      recognition.onend = () => {
        // If no result was captured, reject
        reject(new Error('No speech detected'));
      };
      
      recognition.start();
    });
  }, []);

  const ask = useCallback(async (question: string): Promise<string> => {
    await speak(question);
    // 500ms delay after TTS before listening
    await new Promise(resolve => setTimeout(resolve, 500));
    return await listen();
  }, [speak, listen]);

  return {
    speak,
    listen,
    ask
  };
};
