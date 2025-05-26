import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceState } from '@/types/voice';
import { cn } from '@/lib/utils';
import { getTranslations } from '@/translations';

interface VoiceButtonProps {
  voiceState: VoiceState;
  onPress: () => void;
  disabled?: boolean;
  isWaitingForClick?: boolean;
  language: 'fi' | 'et' | 'en';
}

const getButtonState = (status: VoiceState['status'], isWaitingForClick: boolean = false, t: any) => {
  if (isWaitingForClick) {
    return {
      text: t.readyForClick,
      color: 'bg-orange-500 hover:bg-orange-600',
      pulse: true
    };
  }

  switch (status) {
    case 'idle':
      return {
        text: t.startConversation,
        color: 'bg-gray-400 hover:bg-gray-500',
        pulse: false
      };
    case 'greeting':
      return {
        text: t.greetingInProgress,
        color: 'bg-blue-500',
        pulse: true
      };
    case 'recording':
      return {
        text: t.listening,
        color: 'bg-red-500',
        pulse: true
      };
    case 'sending':
      return {
        text: t.sending,
        color: 'bg-yellow-500',
        pulse: false
      };
    case 'waiting':
      return {
        text: t.waitingResponse,
        color: 'bg-blue-500',
        pulse: true
      };
    case 'playing':
      return {
        text: t.playingResponse,
        color: 'bg-green-500',
        pulse: false
      };
    default:
      return {
        text: t.startConversation,
        color: 'bg-gray-400 hover:bg-gray-500',
        pulse: false
      };
  }
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  voiceState,
  onPress,
  disabled = false,
  isWaitingForClick = false,
  language
}) => {
  const t = getTranslations(language);
  const buttonState = getButtonState(voiceState.status, isWaitingForClick, t);
  const isDisabled = disabled || (voiceState.status !== 'idle' && !isWaitingForClick);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={onPress}
        disabled={isDisabled}
        className={cn(
          'w-24 h-24 rounded-full transition-all duration-200',
          buttonState.color,
          isWaitingForClick ? 'animate-gentle-pulse' : (buttonState.pulse && 'animate-pulse'),
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
