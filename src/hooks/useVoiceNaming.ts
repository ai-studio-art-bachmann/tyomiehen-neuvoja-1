
import { useState, useCallback } from 'react';
import { useMicrophone } from './useMicrophone';
import { WebhookService } from '@/services/webhookService';
import { Translations } from '@/translations/types';

interface UseVoiceNamingProps {
  t: Translations;
  webhookUrl: string;
}

interface VoiceNamingResult {
  filename: string;
  metadata: {
    location?: string;
    unit?: string;
    description?: string;
  };
}

export const useVoiceNaming = ({ t, webhookUrl }: UseVoiceNamingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const microphone = useMicrophone();
  const webhookService = new WebhookService();

  const startListeningForName = useCallback(async (): Promise<VoiceNamingResult> => {
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
              
              // Parse transcription to extract filename and metadata
              const result = parseVoiceInput(transcription);
              console.log('Transcription:', transcription, 'Parsed result:', result);
              
              setIsProcessing(false);
              resolve(result);
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

  const stopListeningForName = useCallback(async (): Promise<VoiceNamingResult> => {
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
      
      // Parse transcription to extract filename and metadata
      const result = parseVoiceInput(transcription);
      console.log('Transcription:', transcription, 'Parsed result:', result);
      
      setIsProcessing(false);
      return result;
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

// Enhanced function to parse Estonian voice input and extract metadata
const parseVoiceInput = (transcription: string): VoiceNamingResult => {
  if (!transcription) {
    return {
      filename: 'photo',
      metadata: {}
    };
  }
  
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
  
  let text = transcription.toLowerCase().trim();
  const originalText = text;
  
  // Extract metadata patterns
  const metadata: VoiceNamingResult['metadata'] = {};
  
  // Look for unit/apartment information (korter X, maja X, etc.)
  const unitMatch = text.match(/\b(korter|maja|büüroo|pood)\s+(\w+)/);
  if (unitMatch) {
    let unitNumber = unitMatch[2];
    // Convert number words to digits for unit number
    Object.entries(numberWords).forEach(([word, digit]) => {
      unitNumber = unitNumber.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    });
    metadata.unit = `${unitMatch[1]} ${unitNumber}`;
  }
  
  // Extract location/room type from the beginning
  const locationWords = ['vannituba', 'elutuba', 'magamistuba', 'köök', 'koridor', 'rõdu', 'keldri', 'pööning'];
  let location = '';
  for (const word of locationWords) {
    if (text.includes(word)) {
      location = word;
      break;
    }
  }
  
  if (location) {
    metadata.location = location;
    metadata.description = originalText;
  }
  
  // Generate filename from the first part (usually the room/location)
  let filename = location || 'photo';
  
  // Add numbers from the text to filename
  let processedText = text;
  Object.entries(numberWords).forEach(([word, digit]) => {
    processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });
  
  // Extract numbers and append to filename
  const numbers = processedText.match(/\d+/g);
  if (numbers) {
    filename += numbers.join('');
  }
  
  // Clean filename
  filename = filename.replace(/[^a-zA-ZäöüõÄÖÜÕ0-9]/g, '');
  
  // Ensure it's not empty
  if (!filename) filename = 'photo';
  
  return {
    filename,
    metadata
  };
};
