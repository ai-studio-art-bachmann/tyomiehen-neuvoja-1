
import { useState, useCallback } from 'react';
import { useMicrophone } from './useMicrophone';
import { WebhookService } from '@/services/webhookService';
import { Translations } from '@/translations/types';

interface UseVoiceNamingProps {
  t: Translations;
  webhookUrl: string;
}

export const useVoiceNaming = ({ t, webhookUrl }: UseVoiceNamingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const microphone = useMicrophone();
  const webhookService = new WebhookService();

  const startListeningForName = useCallback(async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        setIsListening(true);
        console.log('Starting to listen for file name...');
        
        await microphone.startRecording();
        
        // Auto-stop after 10 seconds or when user indicates they're done
        setTimeout(async () => {
          if (microphone.isRecording) {
            try {
              setIsListening(false);
              setIsProcessing(true);
              
              const audioBlob = await microphone.stopRecording();
              console.log('Voice recording completed, processing...');
              
              // Send to webhook for transcription
              const response = await webhookService.sendAudioToWebhook(audioBlob, webhookUrl);
              
              let transcription = '';
              try {
                const parsedResponse = JSON.parse(response);
                transcription = parsedResponse.text || '';
              } catch (e) {
                transcription = response;
              }
              
              // Convert transcription to filename
              const filename = convertToFilename(transcription);
              console.log('Transcription:', transcription, 'Filename:', filename);
              
              setIsProcessing(false);
              resolve(filename);
            } catch (error) {
              console.error('Error processing voice input:', error);
              setIsProcessing(false);
              reject(error);
            }
          }
        }, 10000); // 10 second timeout
        
      } catch (error) {
        console.error('Error starting voice naming:', error);
        setIsListening(false);
        setIsProcessing(false);
        reject(error);
      }
    });
  }, [microphone, webhookService, webhookUrl]);

  const stopListeningForName = useCallback(async (): Promise<string> => {
    try {
      if (!microphone.isRecording) {
        throw new Error('Not currently recording');
      }
      
      setIsListening(false);
      setIsProcessing(true);
      
      const audioBlob = await microphone.stopRecording();
      console.log('Voice recording completed, processing...');
      
      // Send to webhook for transcription
      const response = await webhookService.sendAudioToWebhook(audioBlob, webhookUrl);
      
      let transcription = '';
      try {
        const parsedResponse = JSON.parse(response);
        transcription = parsedResponse.text || '';
      } catch (e) {
        transcription = response;
      }
      
      // Convert transcription to filename
      const filename = convertToFilename(transcription);
      console.log('Transcription:', transcription, 'Filename:', filename);
      
      setIsProcessing(false);
      return filename;
    } catch (error) {
      console.error('Error processing voice input:', error);
      setIsProcessing(false);
      throw error;
    }
  }, [microphone, webhookService, webhookUrl]);

  return {
    isListening,
    isProcessing,
    startListeningForName,
    stopListeningForName,
    cleanup: microphone.cleanup
  };
};

// Helper function to convert Estonian transcription to filename
const convertToFilename = (transcription: string): string => {
  if (!transcription) return 'photo';
  
  // Estonian number words to digits mapping
  const numberWords: { [key: string]: string } = {
    'null': '0',
    'üks': '1',
    'kaks': '2',
    'kolm': '3',
    'neli': '4',
    'viis': '5',
    'kuus': '6',
    'seitse': '7',
    'kaheksa': '8',
    'üheksa': '9',
    'kümme': '10',
    'üksteist': '11',
    'kaksteist': '12',
    'kolmteist': '13',
    'neliteist': '14',
    'viisteist': '15',
    'kuusteist': '16',
    'seitseteist': '17',
    'kaheksateist': '18',
    'üheksateist': '19',
    'kakskümmend': '20',
    'kolmkümmend': '30',
    'nelikümmend': '40',
    'viiskümmend': '50',
    'kuuskümmend': '60',
    'seitsekümmend': '70',
    'kaheksakümmend': '80',
    'üheksakümmend': '90',
    'sada': '100'
  };
  
  let result = transcription.toLowerCase().trim();
  
  // Replace Estonian number words with digits
  Object.entries(numberWords).forEach(([word, digit]) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });
  
  // Handle compound numbers like "kakskümmend neli" -> "24"
  result = result.replace(/(\d+)\s+(\d+)/g, '$1$2');
  
  // Remove special characters except letters, numbers, and spaces
  result = result.replace(/[^a-zA-ZäöüõÄÖÜÕ0-9\s]/g, '');
  
  // Replace spaces with nothing or underscore
  result = result.replace(/\s+/g, '');
  
  // Ensure it's not empty
  if (!result) result = 'photo';
  
  return result;
};
