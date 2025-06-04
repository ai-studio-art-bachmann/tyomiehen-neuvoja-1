import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from '@/translations';
import { useCameraManager } from '@/hooks/useCameraManager';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useVoiceNaming } from '@/hooks/useVoiceNaming';
import { CameraView } from './CameraView';
import { CameraControls } from './CameraControls';
import { toast } from '@/hooks/use-toast';

interface CameraProps {
  webhookUrl: string;
  language: 'fi' | 'et' | 'en';
}

export const Camera: React.FC<CameraProps> = ({ webhookUrl, language }) => {
  const t = getTranslations(language);
  
  const {
    videoRef,
    canvasRef,
    isCameraOn,
    photoTaken,
    isWaitingForName,
    startCamera,
    stopCamera,
    takePhoto,
    resetPhoto,
    setPhotoTaken,
    setIsWaitingForName
  } = useCameraManager({ t });

  const {
    isUploading,
    progress,
    uploadPhoto,
  } = usePhotoUpload({ 
    webhookUrl, 
    photoTaken, 
    t, 
    onUploadSuccess: () => setPhotoTaken(null)
  });

  const {
    isListening,
    isProcessing,
    startListeningForName,
    stopListeningForName,
    cleanup: cleanupVoice
  } = useVoiceNaming({ t, webhookUrl });

  const handleStartListening = async () => {
    try {
      const result = await startListeningForName();
      console.log('Got voice naming result:', result);
      
      // Upload with custom filename and metadata
      await uploadPhoto(result.filename, result.metadata);
      setIsWaitingForName(false);
      
      const metadataText = result.metadata.unit ? ` (${result.metadata.unit})` : '';
      toast({
        title: "Foto nimetatud ja üles laetud",
        description: `Failinimi: ${result.filename}.jpg${metadataText}`,
      });
    } catch (error) {
      console.error('Voice naming error:', error);
      toast({
        title: "Häälnimetamine ebaõnnestus",
        description: "Proovi uuesti või jäta vahele",
        variant: "destructive"
      });
    }
  };

  const handleStopListening = async () => {
    try {
      const result = await stopListeningForName();
      console.log('Got voice naming result:', result);
      
      // Upload with custom filename and metadata
      await uploadPhoto(result.filename, result.metadata);
      setIsWaitingForName(false);
      
      const metadataText = result.metadata.unit ? ` (${result.metadata.unit})` : '';
      toast({
        title: "Foto nimetatud ja üles laetud",
        description: `Failinimi: ${result.filename}.jpg${metadataText}`,
      });
    } catch (error) {
      console.error('Voice naming error:', error);
      toast({
        title: "Häälnimetamine ebaõnnestus",
        description: "Proovi uuesti või jäta vahele",
        variant: "destructive"
      });
    }
  };

  const handleSkipNaming = () => {
    setIsWaitingForName(false);
    // Upload with default timestamp name
    uploadPhoto();
  };

  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, [cleanupVoice]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <CameraView
        videoRef={videoRef}
        isCameraOn={isCameraOn}
        photoTaken={photoTaken}
        t={t}
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {progress > 0 && (
        <Progress value={progress} className="w-full h-1 bg-gray-200" />
      )}
      
      <CameraControls
        isCameraOn={isCameraOn}
        photoTaken={photoTaken}
        isWaitingForName={isWaitingForName}
        isUploading={isUploading}
        isListening={isListening}
        isProcessing={isProcessing}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onTakePhoto={takePhoto}
        onUploadPhoto={uploadPhoto}
        onResetPhoto={resetPhoto}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        onSkipNaming={handleSkipNaming}
        t={t}
      />
    </div>
  );
};
