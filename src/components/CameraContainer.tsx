
import React from 'react';
import { getTranslations } from '@/translations';
import { CameraVoiceFlow } from './CameraVoiceFlow';

interface CameraContainerProps {
  webhookUrl: string;
  language: 'fi' | 'et' | 'en';
}

export const CameraContainer: React.FC<CameraContainerProps> = ({ webhookUrl, language }) => {
  const t = getTranslations(language);

  return (
    <div className="flex flex-col items-center space-y-4">
      <CameraVoiceFlow webhookUrl={webhookUrl} />
    </div>
  );
};
