
import { useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Translations } from '@/translations/types'; // Assuming Translations type is exported

interface UseCameraManagerProps {
  t: Translations; // Use the actual Translations type
}

export const useCameraManager = ({ t }: UseCameraManagerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);

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
        setPhotoTaken(null); // Reset photo if camera is restarted
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
        stopCamera(); // Stop camera after taking photo, can be adjusted
      }
    }
  }, [isCameraOn, stopCamera]);

  const resetPhoto = useCallback(() => {
    setPhotoTaken(null);
    // Optionally, restart camera automatically if needed
    // startCamera(); 
  }, []);
  
  // Ensure camera is stopped when component unmounts or hook is no longer used
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
    startCamera,
    stopCamera,
    takePhoto,
    resetPhoto,
    setPhotoTaken // Expose setPhotoTaken if needed externally
  };
};
