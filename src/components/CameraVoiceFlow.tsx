import React from 'react';
import { Button } from '@/components/ui/button';
import { useCameraVoiceFlow } from '@/hooks/useCameraVoiceFlow';
import { Mic, Camera, RotateCcw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraVoiceFlowProps {
  webhookUrl: string;
}

export const CameraVoiceFlow: React.FC<CameraVoiceFlowProps> = ({ webhookUrl }) => {
  const flow = useCameraVoiceFlow(webhookUrl);

  const getStepDescription = () => {
    switch (flow.step) {
      case 'idle':
        return 'Aloita ottamalla kuva';
      case 'camera':
        return 'Kamera on päällä - ota kuva';
      case 'captured':
        return 'Kuva otettu - aloitetaan ääniohjaus';
      case 'asking-name':
        return 'Kysyn tiedoston nimeä...';
      case 'listening':
        return 'Kuuntelen vastaustasi...';
      case 'asking-choice':
        return 'Kysyn analyysitoivetta...';
      case 'processing':
        return 'Käsittelen kuvaa...';
      case 'playing':
        return 'Toisin analyysiä...';
      default:
        return 'Aloita ottamalla kuva';
    }
  };

  const getMainButton = () => {
    switch (flow.step) {
      case 'idle':
        return (
          <Button
            onClick={flow.startFlow}
            size="lg"
            className="w-full"
          >
            <Camera className="mr-2" />
            Aloita kuvanotto
          </Button>
        );
      
      case 'camera':
        return (
          <Button
            onClick={flow.capturePhoto}
            size="lg"
            className="w-full"
          >
            <Camera className="mr-2" />
            Ota kuva
          </Button>
        );
      
      case 'captured':
        return (
          <div className="w-full h-12 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
            <p>Valmistaudun ääniohjaukseen...</p>
          </div>
        );
      
      case 'asking-name':
      case 'listening':
      case 'asking-choice':
        return (
          <div className="w-full h-12 flex items-center justify-center rounded-md bg-muted">
            <div className="flex items-center text-muted-foreground">
                <Mic size={20} className="mr-2 animate-pulse text-primary" />
                <p>Kuuntelen...</p>
            </div>
          </div>
        );
      
      case 'processing':
        return (
            <Button disabled className="w-full" size="lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                Käsittelen...
            </Button>
        );
      
      case 'playing':
        return (
            <Button disabled className="w-full" size="lg">
                <Volume2 size={20} className="mr-2 animate-pulse" />
                Toistetaan analyysiä...
            </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      {/* Camera View */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={flow.videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            flow.step === 'camera' ? 'block' : 'hidden'
          )}
        />
        {flow.photoBlob && (
          <img
            src={URL.createObjectURL(flow.photoBlob)}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        {flow.step === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-lg">Kamera ei ole käytössä</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={flow.canvasRef} className="hidden" />

      {/* Status */}
      <div className="text-center max-w-md">
        <p className="text-gray-700 font-medium text-lg">{getStepDescription()}</p>
        {flow.fileName && (
          <p className="text-sm text-gray-500 mt-1">Tiedosto: {flow.fileName}.jpg</p>
        )}
        {!flow.isOnline && (
          <p className="text-sm text-amber-600 mt-1 font-medium">⚠️ Offline-tila - tallennus lykätään</p>
        )}
      </div>

      {/* Main Action Button */}
      <div className="w-full max-w-md">
        {getMainButton()}
      </div>

      {/* Reset Button */}
      {flow.step !== 'idle' && (
        <Button
          onClick={flow.resetFlow}
          variant="outline"
          className="w-full max-w-md"
        >
          <RotateCcw className="mr-2" size={16} />
          Aloita alusta
        </Button>
      )}
    </div>
  );
};
