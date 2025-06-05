import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from '@/translations';
import { useCameraManager } from '@/hooks/useCameraManager';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useVoiceNaming } from '@/hooks/useVoiceNaming';
import { useAudioResponse } from '@/hooks/useAudioResponse';
import { CameraView } from './CameraView';
import { CameraControls } from './CameraControls';
import { toast } from '@/hooks/use-toast';

interface CameraProps {
  webhookUrl: string;
  language: 'fi' | 'et' | 'en';
}

export const Camera: React.FC<CameraProps> = ({ webhookUrl, language }) => {
  const t = getTranslations(language);
  const [isAsking, setIsAsking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

  const { playAudioResponse, isPlaying } = useAudioResponse();

  // Automaattinen äänikysely kuva võtmise järel
  useEffect(() => {
    if (photoTaken && isWaitingForName && !isAsking) {
      askForFilename();
    }
  }, [photoTaken, isWaitingForName, isAsking]);

  const askForFilename = async () => {
    setIsAsking(true);
    try {
      // Loo äänikysymys puhesynteesillä
      const utterance = new SpeechSynthesisUtterance("Anna failile nimi häälega");
      utterance.lang = 'et-EE';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Oota, et ääni on esitatud lõpuni
      await new Promise((resolve) => {
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Puhesynteesi epäonnistui:', error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleStartListening = async () => {
    try {
      console.log('Alustan häälnimetunnistust...');
      const result = await startListeningForName();
      console.log('Saatiin ääninimetunnistus:', result);
      
      setIsAnalyzing(true);
      
      // Lähetä kuva analyysiin
      const response = await uploadPhotoForAnalysis(result.filename, result.metadata);
      
      // Käsittele vastaus ja toista ääni automaattisesti
      if (response?.audioResponse) {
        await playAudioResponse(response.audioResponse);
      }
      
      setIsWaitingForName(false);
      setIsAnalyzing(false);
      
      toast({
        title: "Analüüs valmis",
        description: `Pilt analüüsitud: ${result.filename}.jpg`,
      });
    } catch (error) {
      console.error('Ääninimetunnistus epäonnistui:', error);
      setIsAnalyzing(false);
      
      // Äänipalautetta virheestä
      try {
        const errorUtterance = new SpeechSynthesisUtterance("Proovi uuesti");
        errorUtterance.lang = 'et-EE';
        speechSynthesis.speak(errorUtterance);
      } catch (e) {
        console.error('Äänivirheilmoitus epäonnistui:', e);
      }
      
      toast({
        title: "Ääninimetunnistus epäonnistui",
        description: "Proovi uuesti või jäta vahele",
        variant: "destructive"
      });
    }
  };

  const handleStopListening = async () => {
    try {
      console.log('Lopetan häälnimetunnistuse...');
      const result = await stopListeningForName();
      console.log('Saatiin ääninimetunnistus:', result);
      
      setIsAnalyzing(true);
      
      // Lähetä kuva analyysiin
      const response = await uploadPhotoForAnalysis(result.filename, result.metadata);
      
      // Käsittele vastaus ja toista ääni automaattisesti
      if (response?.audioResponse) {
        await playAudioResponse(response.audioResponse);
      }
      
      setIsWaitingForName(false);
      setIsAnalyzing(false);
      
      toast({
        title: "Analüüs valmis",
        description: `Pilt analüüsitud: ${result.filename}.jpg`,
      });
    } catch (error) {
      console.error('Ääninimetunnistus epäonnistui:', error);
      setIsAnalyzing(false);
      
      // Äänipalautetta virheestä
      try {
        const errorUtterance = new SpeechSynthesisUtterance("Proovi uuesti");
        errorUtterance.lang = 'et-EE';
        speechSynthesis.speak(errorUtterance);
      } catch (e) {
        console.error('Äänivirheilmoitus epäonnistui:', e);
      }
      
      toast({
        title: "Ääninimetunnistus epäonnistui",
        description: "Proovi uuesti või jäta vahele",
        variant: "destructive"
      });
    }
  };

  const uploadPhotoForAnalysis = async (filename: string, metadata: any) => {
    if (!photoTaken) return null;
    
    try {
      console.log('Laen üles pildi analüüsiks:', filename, metadata);
      const response = await fetch(photoTaken);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, `${filename}.jpg`);
      formData.append('filename', `${filename}.jpg`);
      formData.append('filetype', 'image/jpeg');
      formData.append('source', 'camera');
      formData.append('metadata', JSON.stringify(metadata));
      
      const uploadResponse = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json,*/*'
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Server vastas veaga: ${uploadResponse.status}`);
      }
      
      const data = await uploadResponse.json();
      console.log('Analüüsi vastus:', data);
      
      return data;
    } catch (error) {
      console.error('Pildi analüüs ebaõnnestus:', error);
      throw error;
    }
  };

  const handleSkipNaming = () => {
    console.log('Jätan häälnimetamise vahele...');
    setIsWaitingForName(false);
    // Lähetä oletusarvoisella nimellä
    uploadPhoto();
  };

  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, [cleanupVoice]);

  const showLoadingIndicator = isAsking || isAnalyzing || isPlaying;

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
      
      {showLoadingIndicator && (
        <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700">
            {isAsking && "Küsin faili nime..."}
            {isAnalyzing && "Analüüsin pilti..."}
            {isPlaying && "Esitan vastust..."}
          </p>
        </div>
      )}
      
      <CameraControls
        isCameraOn={isCameraOn}
        photoTaken={photoTaken}
        isWaitingForName={isWaitingForName}
        isUploading={isUploading}
        isListening={isListening}
        isProcessing={isProcessing}
        isAsking={isAsking}
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
