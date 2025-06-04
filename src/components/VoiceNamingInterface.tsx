
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Translations } from '@/translations/types';
import { cn } from '@/lib/utils';

interface VoiceNamingInterfaceProps {
  isListening: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSkip: () => void;
  t: Translations;
}

export const VoiceNamingInterface: React.FC<VoiceNamingInterfaceProps> = ({
  isListening,
  isProcessing,
  onStartListening,
  onStopListening,
  onSkip,
  t
}) => {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-blue-700">Töötlen häälkäsklust...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-amber-50 rounded-lg">
      <p className="text-sm text-amber-800 text-center font-medium">
        Anna fotole nimi häälkäsklusega
      </p>
      
      <div className="flex items-center space-x-3">
        <Button
          onClick={isListening ? onStopListening : onStartListening}
          className={cn(
            'w-16 h-16 rounded-full transition-all duration-200',
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-orange-600 hover:bg-orange-700'
          )}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
        
        <Button
          onClick={onSkip}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
        >
          Jäta vahele
        </Button>
      </div>
      
      <p className="text-xs text-amber-600 text-center">
        {isListening 
          ? "Kuulan... Vajuta punast nuppu lõpetamiseks" 
          : "Vajuta mikrofoni, et anda failile nimi"
        }
      </p>
      
      <p className="text-xs text-gray-500 text-center">
        Näide: "elutuba kakskümmend neli" → elutuba24.jpg
      </p>
    </div>
  );
};
