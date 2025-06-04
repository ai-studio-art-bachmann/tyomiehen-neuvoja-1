
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Translations } from '@/translations/types';

interface UsePhotoUploadProps {
  webhookUrl: string;
  photoTaken: string | null;
  t: Translations;
  onUploadSuccess: () => void;
}

export const usePhotoUpload = ({ webhookUrl, photoTaken, t, onUploadSuccess }: UsePhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPhoto = useCallback(async (customFilename?: string) => {
    if (!photoTaken) return;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      const response = await fetch(photoTaken);
      const blob = await response.blob();
      
      // Use custom filename if provided, otherwise use timestamp
      const baseFilename = customFilename || `photo_${new Date().toISOString().replace(/:/g, '-')}`;
      const filename = `${baseFilename}.jpg`;
      
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('filename', filename);
      formData.append('filetype', 'image/jpeg');
      formData.append('source', 'camera');
      
      setProgress(30);
      
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
      
      const data = await uploadResponse.json();
      console.log('Photo upload response:', data);
      
      toast({
        title: t.photoUploaded || "Photo uploaded",
        description: `${t.photoUploadedSuccess || "Photo was uploaded successfully"} (${filename})`,
      });
      
      onUploadSuccess();
      
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
  }, [photoTaken, webhookUrl, t, onUploadSuccess]);

  return {
    isUploading,
    progress,
    uploadPhoto,
  };
};
