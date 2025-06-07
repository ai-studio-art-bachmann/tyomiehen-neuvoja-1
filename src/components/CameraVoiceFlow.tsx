
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCameraVoiceFlow } from '@/hooks/useCameraVoiceFlow';
import { Mic, Camera, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraVoiceFlowProps {
  webhookUrl: string;
}

export const CameraVoiceFlow: React.FC<CameraVoiceFlowProps> = ({ webhookUrl }) => {
  const flow = useCameraVoiceFlow(webhookUrl);

  const getStepDescription = () => {
    switch (flow.step) {
      case 'camera':
        return 'Kamera on päällä - ota kuva';
      case 'captured':
        return 'Kuva otettu';
      case 'asking-name':
        return 'Kysyn tiedoston nimeä...';
      case 'listening':
        return 'Kuuntelen vastaustasi...';
      case 'asking-choice':
        return 'Kysyn analyysitoivetta...';
      case 'processing':
        return 'Käsittelen kuvaa...';
      case 'playing':
        return 'Toistin analyysiä...';
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
            className="w-full h-20 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg font-semibold"
          >
            <Camera className="mr-2" size={24} />
            Aloita kuvanotto
          </Button>
        );
      
      case 'camera':
        return (
          <Button
            onClick={flow.capturePhoto}
            className="w-full h-20 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold"
          >
            <Camera className="mr-2" size={24} />
            Ota kuva
          </Button>
        );
      
      case 'asking-name':
      case 'listening':
      case 'asking-choice':
        return (
          <div className="w-full h-20 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <div className={cn(
              "w-16 h-16 bg-white rounded-full flex items-center justify-center",
              (flow.step === 'listening' || flow.step === 'asking-name' || flow.step === 'asking-choice') && "animate-pulse"
            )}>
              <Mic size={32} className="text-green-600" />
            </div>
          </div>
        );
      
      case 'processing':
      case 'playing':
        return (
          <div className="w-full h-20 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      {/* Camera View */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
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
            <p className="text-white text-lg">Kamera ei ole käytössä</p>
          </div>
        )}
      </div>

      <canvas ref={flow.canvasRef} className="hidden" />

      {/* Status */}
      <div className="text-center">
        <p className="text-gray-700 font-medium">{getStepDescription()}</p>
        {flow.fileName && (
          <p className="text-sm text-gray-500 mt-1">Tiedosto: {flow.fileName}.jpg</p>
        )}
        {!flow.isOnline && (
          <p className="text-sm text-amber-600 mt-1">⚠️ Offline-tila - tallennus lykätään</p>
        )}
      </div>

      {/* Main Action Button */}
      {getMainButton()}

      {/* Reset Button */}
      {flow.step !== 'idle' && (
        <Button
          onClick={flow.resetFlow}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="mr-2" size={16} />
          Aloita alusta
        </Button>
      )}
    </div>
  );
};
