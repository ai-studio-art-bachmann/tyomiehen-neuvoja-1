
import React from 'react';
import { Button } from '@/components/ui/button';
import { Translations } from '@/translations/types';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

interface VoiceNamingInterfaceProps {
  isListening: boolean;
  isProcessing: boolean;
  isAsking?: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSkip: () => void;
  t: Translations;
}

export const VoiceNamingInterface: React.FC<VoiceNamingInterfaceProps> = ({
  isListening,
  isProcessing,
  isAsking = false,
  onStartListening,
  onStopListening,
  onSkip,
  t
}) => {
  if (isAsking) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4 bg-green-50 rounded-lg">
        <div className="animate-pulse rounded-full h-8 w-8 bg-green-600"></div>
        <p className="text-sm text-green-700">Kysyn tiedoston nimeä...</p>
      </div>
    );
  }

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
      
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <Button
            onClick={isListening ? onStopListening : onStartListening}
            className={cn(
              'w-32 h-32 rounded-full p-0 border-0 shadow-lg transition-all duration-200',
              'bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300',
              isListening && 'animate-pulse bg-red-500 hover:bg-red-600 focus:ring-red-300'
            )}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Mic 
                size={32} 
                className={cn(
                  'text-gray-700',
                  isListening && 'text-red-600'
                )}
              />
            </div>
          </Button>
        </div>
        
        <p className="text-sm text-center font-medium text-gray-700">
          Aloita keskustelu
        </p>
        
        <Button
          onClick={onSkip}
          variant="outline"
          className="text-gray-600 hover:text-gray-800 mt-2"
        >
          Jäta vahele
        </Button>
      </div>
      
      <p className="text-xs text-amber-600 text-center">
        {isListening 
          ? "Kuulan... Vajuta nuppu lõpetamiseks" 
          : "Vajuta mikrofoni, et anda failile nimi"
        }
      </p>
      
      <p className="text-xs text-gray-500 text-center">
        Näide: "vannituba korter kakskümmend neli" → vannituba24.jpg + metaandmed
      </p>
    </div>
  );
};
