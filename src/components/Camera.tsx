
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
  const [isAskingForAnalysisChoice, setIsAskingForAnalysisChoice] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
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
      const utterance = new SpeechSynthesisUtterance("Anna failile nimi häälega");
      utterance.lang = 'et-EE';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
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

  const askForAnalysisChoice = async () => {
    setIsAskingForAnalysisChoice(true);
    try {
      const utterance = new SpeechSynthesisUtterance("Kas soovid kuulda pildi analüüsi kohe? Ütle jah või ei.");
      utterance.lang = 'et-EE';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      await new Promise((resolve) => {
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Puhesynteesi epäonnistui:', error);
    } finally {
      setIsAskingForAnalysisChoice(false);
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
      setAnalysisResult(response);
      
      setIsWaitingForName(false);
      setIsAnalyzing(false);
      
      // Kysy käyttäjältä, haluaako kuulla analyysin
      await askForAnalysisChoice();
      
      toast({
        title: "Kuva analysoidtu",
        description: `Pilt analüüsitud: ${result.filename}.jpg`,
      });
    } catch (error) {
      console.error('Ääninimetunnistus epäonnistui:', error);
      setIsAnalyzing(false);
      handleVoiceError();
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
      setAnalysisResult(response);
      
      setIsWaitingForName(false);
      setIsAnalyzing(false);
      
      // Kysy käyttäjältä, haluaako kuulla analyysin
      await askForAnalysisChoice();
      
      toast({
        title: "Kuva analysoidtu",
        description: `Pilt analüüsitud: ${result.filename}.jpg`,
      });
    } catch (error) {
      console.error('Ääninimetunnistus epäonnistui:', error);
      setIsAnalyzing(false);
      handleVoiceError();
    }
  };

  const handleAnalysisChoice = async (choice: 'yes' | 'no') => {
    if (choice === 'yes' && analysisResult?.audioResponse) {
      try {
        await playAudioResponse(analysisResult.audioResponse);
        
        // Äänipalautetta analyysin kuulemisesta
        const confirmUtterance = new SpeechSynthesisUtterance("Analyysi on valmis. Voit ottaa uuden kuvan.");
        confirmUtterance.lang = 'et-EE';
        speechSynthesis.speak(confirmUtterance);
      } catch (error) {
        console.error('Analyysin toisto epäonnistui:', error);
      }
    } else {
      // Äänipalautetta analyysin tallentamisesta
      const saveUtterance = new SpeechSynthesisUtterance("Analyysi on tallennettu. Voit ottaa uuden kuvan.");
      saveUtterance.lang = 'et-EE';
      speechSynthesis.speak(saveUtterance);
    }
    
    // Nollaa tilat uutta kuvaa varten
    setAnalysisResult(null);
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

  const handleVoiceError = () => {
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
  };

  const handleSkipNaming = () => {
    console.log('Jätan häälnimetamise vahele...');
    setIsWaitingForName(false);
    uploadPhoto();
  };

  useEffect(() => {
    return () => {
      cleanupVoice();
    };
  }, [cleanupVoice]);

  const showLoadingIndicator = isAsking || isAnalyzing || isPlaying || isAskingForAnalysisChoice;

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
            {isAskingForAnalysisChoice && "Küsin analüüsi valikut..."}
          </p>
        </div>
      )}
      
      {/* Analyysi valiku nupud */}
      {analysisResult && !isPlaying && !isAskingForAnalysisChoice && (
        <div className="flex flex-col items-center space-y-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            Kas soovid kuulda pildi analüüsi?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnalysisChoice('yes')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Jah, kuulen
            </button>
            <button
              onClick={() => handleAnalysisChoice('no')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Ei, salvesta
            </button>
          </div>
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
