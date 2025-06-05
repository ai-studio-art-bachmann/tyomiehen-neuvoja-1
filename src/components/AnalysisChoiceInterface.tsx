
import React from 'react';
import { Button } from '@/components/ui/button';
import { Translations } from '@/translations/types';

interface AnalysisChoiceInterfaceProps {
  onChoiceYes: () => void;
  onChoiceNo: () => void;
  isAskingChoice: boolean;
  analysisResult: any;
  isPlaying: boolean;
  t: Translations;
}

export const AnalysisChoiceInterface: React.FC<AnalysisChoiceInterfaceProps> = ({
  onChoiceYes,
  onChoiceNo,
  isAskingChoice,
  analysisResult,
  isPlaying,
  t
}) => {
  if (isAskingChoice) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4 bg-blue-50 rounded-lg">
        <div className="animate-pulse rounded-full h-8 w-8 bg-blue-600"></div>
        <p className="text-sm text-blue-700">Küsin analüüsi valikut...</p>
      </div>
    );
  }

  if (analysisResult && !isPlaying && !isAskingChoice) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 text-center">
          Kuva on analysoidud!
        </h3>
        
        <p className="text-sm text-green-700 text-center font-medium">
          Kas soovid kuulda pildi analüüsi kohe?
        </p>
        
        <div className="flex space-x-4">
          <Button
            onClick={onChoiceYes}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Jah, kuulen kohe
          </Button>
          <Button
            onClick={onChoiceNo}
            variant="outline"
            className="px-6 py-3 border-green-600 text-green-600 hover:bg-green-50 font-medium"
          >
            Ei, salvesta hilisemaks
          </Button>
        </div>
        
        <p className="text-xs text-green-600 text-center">
          Analyysi tallennetaan automaattisesti tietokantaan
        </p>
      </div>
    );
  }

  return null;
};
