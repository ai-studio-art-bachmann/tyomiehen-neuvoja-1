
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
    conversation.reset(); // Reset conversation when language changes
  };

  const handleReset = () => {
    conversation.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center text-orange-600">
            Työmiehen paras kaveri!
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Ääniohjattu työkalu rakennustyömaalle
          </p>
        </div>
      </header>

      {/* Language Selector */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto">
          <LanguageSelector
            currentLanguage={config.language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        {/* Chat Panel */}
        <DynamicResponsePanel messages={conversation.messages} />

        {/* Voice Controls */}
        <div className="bg-white border-t p-6">
          <div className="flex flex-col items-center space-y-4">
            <VoiceButton
              voiceState={conversation.voiceState}
              onPress={conversation.handleVoiceInteraction}
              disabled={conversation.isDisabled}
            />
            
            {conversation.messages.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                Aloita alusta
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-2">
        <p className="text-xs text-gray-500 text-center">
          Powered by Työkalu App v1.0
        </p>
      </footer>
    </div>
  );
};

export default Index;
