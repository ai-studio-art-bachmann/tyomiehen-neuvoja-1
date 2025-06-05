
import React from 'react';
import { Button } from '@/components/ui/button';
import { Translations } from '@/translations/types';
import { VoiceNamingInterface } from './VoiceNamingInterface';

interface CameraControlsProps {
  isCameraOn: boolean;
  photoTaken: string | null;
  isWaitingForName: boolean;
  isUploading: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isAsking?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTakePhoto: () => void;
  onUploadPhoto: (filename?: string) => void;
  onResetPhoto: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSkipNaming: () => void;
  t: Translations;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isCameraOn,
  photoTaken,
  isWaitingForName,
  isUploading,
  isListening,
  isProcessing,
  isAsking = false,
  onStartCamera,
  onStopCamera,
  onTakePhoto,
  onUploadPhoto,
  onResetPhoto,
  onStartListening,
  onStopListening,
  onSkipNaming,
  t,
}) => {
  // Show voice naming interface when waiting for name
  if (isWaitingForName) {
    return (
      <VoiceNamingInterface
        isListening={isListening}
        isProcessing={isProcessing}
        isAsking={isAsking}
        onStartListening={onStartListening}
        onStopListening={onStopListening}
        onSkip={onSkipNaming}
        t={t}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {!isCameraOn && !photoTaken && (
        <Button onClick={onStartCamera} className="bg-orange-600 hover:bg-orange-700">
          {t.startCamera || "Start Camera"}
        </Button>
      )}
      
      {isCameraOn && !photoTaken && (
        <>
          <Button onClick={onTakePhoto} className="bg-orange-600 hover:bg-orange-700">
            {t.takePhoto || "Take Photo"}
          </Button>
          <Button onClick={onStopCamera} variant="outline">
            {t.stopCamera || "Stop Camera"}
          </Button>
        </>
      )}
      
      {photoTaken && !isWaitingForName && (
        <>
          <Button 
            onClick={() => onUploadPhoto()} 
            disabled={isUploading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isUploading ? 
              (t.uploading || "Uploading...") : 
              (t.uploadPhoto || "Upload Photo")
            }
          </Button>
          <Button onClick={onResetPhoto} variant="outline" disabled={isUploading}>
            {t.retake || "Retake"}
          </Button>
        </>
      )}
    </div>
  );
};
