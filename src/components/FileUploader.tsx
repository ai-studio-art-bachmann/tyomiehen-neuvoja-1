import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from '@/translations';

interface FileUploaderProps {
  webhookUrl: string;
  language: 'fi' | 'et' | 'en';
}

export const FileUploader: React.FC<FileUploaderProps> = ({ webhookUrl, language }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const t = getTranslations(language);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: t.noFileSelected || "No file selected",
        description: t.pleaseSelectFile || "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', selectedFile.name);
      formData.append('filetype', selectedFile.type);
      formData.append('source', 'file_upload');

      setProgress(30);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json,*/*'
        }
      });

      setProgress(90);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setProgress(100);

      const data = await response.json();
      console.log('File upload response:', data);
      
      toast({
        title: t.fileUploaded || "File uploaded",
        description: t.fileUploadedSuccess || "File was uploaded successfully",
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: t.uploadError || "Upload Error",
        description: error instanceof Error ? error.message : t.unknownError || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full">
        <label 
          htmlFor="file-upload" 
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {t.selectFile || "Select File"}:
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-orange-50 file:text-orange-700
            hover:file:bg-orange-100
            disabled:opacity-50"
        />
      </div>

      {progress > 0 && (
        <Progress value={progress} className="w-full h-1 bg-gray-200" />
      )}
      
      <div className="flex items-center justify-center">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isUploading ? 
            (t.uploading || "Uploading...") : 
            (t.uploadFile || "Upload File")
          }
        </Button>
      </div>
      
      {selectedFile && (
        <p className="text-xs text-gray-500 text-center">
          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </p>
      )}
    </div>
  );
};
