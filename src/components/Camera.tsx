import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from '@/translations';
import { useCameraManager } from '@/hooks/useCameraManager';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { CameraView } from './CameraView';
import { CameraControls } from './CameraControls';

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
    startCamera,
    stopCamera,
    takePhoto,
    resetPhoto,
    setPhotoTaken // Get setPhotoTaken to pass to usePhotoUpload
  } = useCameraManager({ t });

  const {
    isUploading,
    progress,
    uploadPhoto,
  } = usePhotoUpload({ 
    webhookUrl, 
    photoTaken, 
    t, 
    onUploadSuccess: () => setPhotoTaken(null) // Reset photoTaken after successful upload
  });

  // Effect to stop camera when component unmounts
  // This is now handled inside useCameraManager, but keeping an explicit one here
  // can be a safeguard or be used for other logic if needed.
  // For now, useCameraManager's internal cleanup should suffice.
  useEffect(() => {
    return () => {
      // console.log("Camera component unmounting, ensuring camera is stopped.");
      // stopCamera(); // Call stopCamera from the hook if needed, though hook itself has cleanup
    };
  }, [stopCamera]); // Ensure stopCamera is stable or remove if hook handles it all

  return (
    <div className="flex flex-col items-center space-y-4">
      <CameraView
        videoRef={videoRef}
        isCameraOn={isCameraOn}
        photoTaken={photoTaken}
        t={t}
      />
      
      {/* Canvas is used by useCameraManager, keep it hidden */}
      <canvas ref={canvasRef} className="hidden" />
      
      {progress > 0 && (
        <Progress value={progress} className="w-full h-1 bg-gray-200" />
      )}
      
      <CameraControls
        isCameraOn={isCameraOn}
        photoTaken={photoTaken}
        isUploading={isUploading}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onTakePhoto={takePhoto}
        onUploadPhoto={uploadPhoto}
        onResetPhoto={resetPhoto}
        t={t}
      />
    </div>
  );
};
