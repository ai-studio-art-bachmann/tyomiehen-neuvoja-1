
import React from 'react';

interface LoadingIndicatorProps {
  isAsking: boolean;
  isAnalyzing: boolean;
  isPlaying: boolean;
  isAskingForAnalysisChoice: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isAsking,
  isAnalyzing,
  isPlaying,
  isAskingForAnalysisChoice
}) => {
  const showLoadingIndicator = isAsking || isAnalyzing || isPlaying || isAskingForAnalysisChoice;

  if (!showLoadingIndicator) return null;

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-blue-700">
        {isAsking && "Küsin faili nime..."}
        {isAnalyzing && "Analüüsin pilti..."}
        {isPlaying && "Esitan vastust..."}
        {isAskingForAnalysisChoice && "Küsin analüüsi valikut..."}
      </p>
    </div>
  );
};
