
import { Translations } from './types';
import { fiTranslations } from './fi';
import { etTranslations } from './et';
import { enTranslations } from './en';

export type Language = 'fi' | 'et' | 'en';

export const getTranslations = (language: Language): Translations => {
  switch (language) {
    case 'fi':
      return fiTranslations;
    case 'et':
      return etTranslations;
    case 'en':
      return enTranslations;
    default:
      // Fallback to Finnish or a specific default if preferred
      // For robustness, ensure the default case always returns a valid Translations object
      const exhaustiveCheck: never = language;
      return fiTranslations; 
  }
};

// Re-export the Translations type for convenience
export type { Translations };

