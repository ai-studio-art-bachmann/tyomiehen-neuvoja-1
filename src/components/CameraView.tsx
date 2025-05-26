
import React from 'react';
import { Translations } from '@/translations/types';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraOn: boolean;
  photoTaken: string | null;
  t: Translations;
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, isCameraOn, photoTaken, t }) => {
  if (photoTaken) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden">
        <img 
          src={photoTaken} 
          alt={t.capturedPhotoAlt} // Nüüd peaks see alati olema defineeritud
          className="w-full" 
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Important for autoplay in some browsers
        className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
      />
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-white">{t.cameraOff || "Camera is off"}</p>
        </div>
      )}
    </div>
  );
};
