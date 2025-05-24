
import React from 'react';
import { Button } from '@/components/ui/button';
import { ConversationConfig } from '@/types/voice';

interface LanguageSelectorProps {
  currentLanguage: ConversationConfig['language'];
  onLanguageChange: (language: ConversationConfig['language']) => void;
}

const languages = [
  { code: 'fi' as const, label: 'Suomi', flag: '🇫🇮' },
  { code: 'et' as const, label: 'Eesti', flag: '🇪🇪' },
  { code: 'en' as const, label: 'English', flag: '🇺🇸' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="flex justify-center space-x-2 p-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLanguage === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => onLanguageChange(lang.code)}
          className="text-xs"
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </Button>
      ))}
    </div>
  );
};

