
import React from 'react';
import { Button } from '@/components/ui/button';
import { Translations } from '@/translations/types';

interface CameraControlsProps {
  isCameraOn: boolean;
  photoTaken: string | null;
  isUploading: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTakePhoto: () => void;
  onUploadPhoto: () => void;
  onResetPhoto: () => void;
  t: Translations;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isCameraOn,
  photoTaken,
  isUploading,
  onStartCamera,
  onStopCamera,
  onTakePhoto,
  onUploadPhoto,
  onResetPhoto,
  t,
}) => {
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
      
      {photoTaken && (
        <>
          <Button 
            onClick={onUploadPhoto} 
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
