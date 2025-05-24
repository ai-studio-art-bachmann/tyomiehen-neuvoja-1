
import React, { useState } from 'react';
import { VoiceButton } from '@/components/VoiceButton';
import { DynamicResponsePanel } from '@/components/DynamicResponsePanel';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useConversation } from '@/hooks/useConversation';
import { ConversationConfig } from '@/types/voice';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [config, setConfig] = useState<ConversationConfig>({
    language: 'fi',
    webhookUrl: 'https://n8n.artbachmann.eu/webhook-test/voice-assistant'
  });

  const conversation = useConversation(config);

  const handleLanguageChange = (language: ConversationConfig['language']) => {
    setConfig(prev => ({ ...prev, language }));
    conversation.reset();
  };

  const handleReset = () => {
    conversation.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      {/* Top spacer for mobile optimization */}
      <div className="pt-16" />

      {/* Header - moved 60px lower */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-orange-100 rounded-b-3xl mx-2">
        <div className="max-w-sm mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-center text-orange-600 mb-2">
            Työmiehen paras kaveri!
          </h1>
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Ääniohjattu työkalu rakennustyömaalle
          </p>
        </div>
      </header>

      {/* Language Selector - improved mobile styling */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 mx-2 mt-2 rounded-xl">
        <div className="max-w-sm mx-auto">
          <LanguageSelector
            currentLanguage={config.language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Main Content - optimized for mobile */}
      <div className="flex-1 max-w-sm mx-auto w-full flex flex-col px-2 mt-4">
        {/* Chat Panel - improved mobile experience */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 flex-1 overflow-hidden">
          <DynamicResponsePanel messages={conversation.messages} />
        </div>

        {/* Voice Controls - enhanced mobile design */}
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg mt-4 mb-4">
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <VoiceButton
                voiceState={conversation.voiceState}
                onPress={conversation.handleVoiceInteraction}
                disabled={conversation.isDisabled}
                isWaitingForClick={conversation.isWaitingForClick}
              />
              
              {conversation.messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                  className="text-xs px-4 py-2 rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Aloita alusta
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - improved mobile styling */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 mx-2 rounded-t-xl">
        <p className="text-xs text-gray-500 text-center font-medium">
          Powered by Työkalu App v1.0
        </p>
      </footer>
    </div>
  );
};

export default Index;
