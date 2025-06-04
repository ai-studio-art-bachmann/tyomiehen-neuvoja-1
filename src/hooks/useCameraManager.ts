
import { useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Translations } from '@/translations/types';

interface UseCameraManagerProps {
  t: Translations;
}

export const useCameraManager = ({ t }: UseCameraManagerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [isWaitingForName, setIsWaitingForName] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: { facingMode: "environment" }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        setPhotoTaken(null);
        setIsWaitingForName(false);
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        title: t.cameraError || "Camera Error",
        description: t.cameraPerm || "Could not access the camera. Please grant permission.",
        variant: "destructive"
      });
      setIsCameraOn(false);
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsWaitingForName(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && isCameraOn) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoTaken(dataUrl);
        setIsWaitingForName(true); // Now waiting for voice name
        stopCamera();
      }
    }
  }, [isCameraOn, stopCamera]);

  const resetPhoto = useCallback(() => {
    setPhotoTaken(null);
    setIsWaitingForName(false);
  }, []);
  
  // Cleanup on unmount
  useState(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  });

  return {
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
  };
};
