
import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceState } from '@/types/voice';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  voiceState: VoiceState;
  onPress: () => void;
  disabled?: boolean;
  isWaitingForClick?: boolean;
}

const getButtonState = (status: VoiceState['status'], isWaitingForClick: boolean = false) => {
  if (isWaitingForClick) {
    return {
      text: 'Kliki kui oled valmis!',
      color: 'bg-orange-500 hover:bg-orange-600',
      pulse: true
    };
  }

  switch (status) {
    case 'idle':
      return {
        text: 'Aloita keskustelu',
        color: 'bg-gray-400 hover:bg-gray-500',
        pulse: false
      };
    case 'greeting':
      return {
        text: 'Tervehdys käynnissä...',
        color: 'bg-blue-500',
        pulse: true
      };
    case 'recording':
      return {
        text: 'Kuuntelen...',
        color: 'bg-red-500',
        pulse: true
      };
    case 'sending':
      return {
        text: 'Lähetän...',
        color: 'bg-yellow-500',
        pulse: false
      };
    case 'waiting':
      return {
        text: 'Odotan vastausta...',
        color: 'bg-blue-500',
        pulse: true
      };
    case 'playing':
      return {
        text: 'Toistan vastausta...',
        color: 'bg-green-500',
        pulse: false
      };
    default:
      return {
        text: 'Aloita keskustelu',
        color: 'bg-gray-400 hover:bg-gray-500',
        pulse: false
      };
  }
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  voiceState,
  onPress,
  disabled = false,
  isWaitingForClick = false
}) => {
  const buttonState = getButtonState(voiceState.status, isWaitingForClick);
  const isDisabled = disabled || (voiceState.status !== 'idle' && !isWaitingForClick);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={onPress}
        disabled={isDisabled}
        className={cn(
          'w-24 h-24 rounded-full transition-all duration-200',
          buttonState.color,
          buttonState.pulse && 'animate-pulse',
          isDisabled && 'opacity-70 cursor-not-allowed'
        )}
        size="lg"
      >
        <Mic className="w-8 h-8 text-white" />
      </Button>
      
      <p className="text-sm font-medium text-gray-700 text-center">
        {buttonState.text}
      </p>
      
      {voiceState.error && (
        <p className="text-xs text-red-600 text-center max-w-xs">
          {voiceState.error}
        </p>
      )}
    </div>
  );
};
