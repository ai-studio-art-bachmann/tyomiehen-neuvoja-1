
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from '@/utils/translations';

interface CameraProps {
  webhookUrl: string;
  language: 'fi' | 'et' | 'en';
}

export const Camera: React.FC<CameraProps> = ({ webhookUrl, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const t = getTranslations(language);

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
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        title: t.cameraError || "Camera Error",
        description: t.cameraPerm || "Could not access the camera. Please grant permission.",
        variant: "destructive"
      });
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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame on canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get data URL representing the image
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoTaken(dataUrl);
      }
    }
  }, []);

  const resetPhoto = useCallback(() => {
    setPhotoTaken(null);
  }, []);
  
  const uploadPhoto = useCallback(async () => {
    if (!photoTaken) return;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      // Convert data URL to blob
      const response = await fetch(photoTaken);
      const blob = await response.blob();
      
      // Create file name with current timestamp
      const filename = `photo_${new Date().toISOString().replace(/:/g, '-')}.jpg`;
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('filename', filename);
      formData.append('filetype', 'image/jpeg');
      formData.append('source', 'camera');
      
      setProgress(30);
      
      // Send to webhook
      const uploadResponse = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json,*/*'
        }
      });
      
      setProgress(90);
      
      if (!uploadResponse.ok) {
        throw new Error(`Server responded with ${uploadResponse.status}`);
      }
      
      setProgress(100);
      
      // Handle the response
      const data = await uploadResponse.json();
      console.log('Photo upload response:', data);
      
      toast({
        title: t.photoUploaded || "Photo uploaded",
        description: t.photoUploadedSuccess || "Photo was uploaded successfully",
      });
      
      // Reset photo
      setPhotoTaken(null);
      
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: t.uploadError || "Upload Error",
        description: error instanceof Error ? error.message : t.unknownError || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [photoTaken, webhookUrl, t]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      {!photoTaken ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
          />
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <p className="text-white">{t.cameraOff || "Camera is off"}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full rounded-lg overflow-hidden">
          <img 
            src={photoTaken} 
            alt="Captured" 
            className="w-full" 
          />
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
      
      {progress > 0 && (
        <Progress value={progress} className="w-full h-1 bg-gray-200" />
      )}
      
      <div className="flex flex-wrap gap-2 justify-center">
        {!isCameraOn && !photoTaken && (
          <Button onClick={startCamera} className="bg-orange-600 hover:bg-orange-700">
            {t.startCamera || "Start Camera"}
          </Button>
        )}
        
        {isCameraOn && !photoTaken && (
          <>
            <Button onClick={takePhoto} className="bg-orange-600 hover:bg-orange-700">
              {t.takePhoto || "Take Photo"}
            </Button>
            <Button onClick={stopCamera} variant="outline">
              {t.stopCamera || "Stop Camera"}
            </Button>
          </>
        )}
        
        {photoTaken && (
          <>
            <Button 
              onClick={uploadPhoto} 
              disabled={isUploading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isUploading ? 
                (t.uploading || "Uploading...") : 
                (t.uploadPhoto || "Upload Photo")
              }
            </Button>
            <Button onClick={resetPhoto} variant="outline" disabled={isUploading}>
              {t.retake || "Retake"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
