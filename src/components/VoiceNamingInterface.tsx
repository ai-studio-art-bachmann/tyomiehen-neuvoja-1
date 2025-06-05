
import React from 'react';
import { Button } from '@/components/ui/button';
import { Translations } from '@/translations/types';
import { cn } from '@/lib/utils';

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
        {/* Mikrofoni nupp - täpselt nagu kuvatõmmisel */}
        <div className="relative">
          <Button
            onClick={isListening ? onStopListening : onStartListening}
            className={cn(
              'w-32 h-32 rounded-full p-0 border-0 shadow-lg transition-all duration-200',
              'bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300',
              isListening && 'animate-pulse bg-red-500 hover:bg-red-600 focus:ring-red-300'
            )}
          >
            {/* Suur valge ring mikrofoni jaoks */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center relative">
              {isListening ? (
                /* Must punkt salvestamise ajal */
                <div className="w-6 h-6 bg-black rounded-full" />
              ) : (
                /* Mikrofoni ikoon vaikimisi olekus */
                <svg 
                  className="w-10 h-10 text-black" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm0 16c2.76 0 5-2.24 5-5v-1h2v1c0 4.28-3.72 7.64-8 7.98V23h-2v-2.02C4.72 20.64 1 17.28 1 13v-1h2v1c0 2.76 2.24 5 5 5z"/>
                </svg>
              )}
            </div>
          </Button>
        </div>
        
        <p className="text-sm text-center font-medium text-gray-700">
          Alusta keskustelu
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
