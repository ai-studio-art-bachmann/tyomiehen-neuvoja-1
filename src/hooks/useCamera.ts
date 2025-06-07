
import { useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Camera open failed:', error);
      throw error;
    }
  }, []);

  const capture = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current || !isOpen) {
        reject(new Error('Camera not ready'));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Optimize to max 1280px width
      const aspectRatio = video.videoHeight / video.videoWidth;
      const maxWidth = 1280;
      const width = Math.min(video.videoWidth, maxWidth);
      const height = width * aspectRatio;
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      context.drawImage(video, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.9);
    });
  }, [isOpen]);

  const close = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsOpen(false);
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
    isOpen,
    open,
    capture,
    close
  };
};
