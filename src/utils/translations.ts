
export interface Translations {
  // Header texts
  headerTitle: string;
  headerSubtitle: string;
  
  // Voice button states
  startConversation: string;
  greetingInProgress: string;
  listening: string;
  sending: string;
  waitingResponse: string;
  playingResponse: string;
  readyForClick: string;
  
  // Chat messages
  startRecording: string;
  stopRecording: string;
  sendingToServer: string;
  processingResponse: string;
  playingAudio: string;
  readyForNext: string;
  startConversationPrompt: string;
  greetingPlayed: string;
  readyToListen: string;
  listeningClickWhenReady: string;
  processingAudio: string;
  
  // Buttons and controls
  resetConversation: string;
  
  // Empty state
  pressToStart: string;
  
  // Footer
  footerText: string;
  
  // Error messages
  voiceError: string;
  tryAgain: string;
  unknownError: string;
  recordingFailed: string;
  noAudioDetected: string;
}

export const translations: Record<'fi' | 'et' | 'en', Translations> = {
  fi: {
    headerTitle: 'Työmiehen paras kaveri!',
    headerSubtitle: 'Ääniohjattu työkalu rakennustyömaalle',
    startConversation: 'Aloita keskustelu',
    greetingInProgress: 'Tervehdys käynnissä...',
    listening: 'Kuuntelen...',
    sending: 'Lähetän...',
    waitingResponse: 'Odotan vastausta...',
    playingResponse: 'Toistan vastausta...',
    readyForClick: 'Kliki kun olet valmis!',
    startRecording: 'Alusta puhuminen...',
    stopRecording: 'Pysäytän nauhoituksen...',
    sendingToServer: 'Lähetän palvelimelle...',
    processingResponse: 'Käsittelen vastausta...',
    playingAudio: 'Toistan äänivastauksen...',
    readyForNext: 'Valmis seuraavaan kysymykseen!',
    startConversationPrompt: 'Aloitan keskustelun...',
    greetingPlayed: 'Tervehdys toistettu!',
    readyToListen: 'Valmis kuuntelemaan!',
    listeningClickWhenReady: 'Kuuntelen... Kliki uuesti kun olet valmis!',
    processingAudio: 'Ääniviestin sisältö käsitellään...',
    resetConversation: 'Aloita alusta',
    pressToStart: 'Paina mikrofonia aloittaaksesi keskustelun',
    footerText: 'Powered by Työkalu App v1.0',
    voiceError: 'Virhe äänikäskyssä',
    tryAgain: 'Yritä uudelleen',
    unknownError: 'Tuntematon virhe',
    recordingFailed: 'Äänitallennus epäonnistui - ei ääntä havaittu',
    noAudioDetected: 'Ei ääntä havaittu'
  },
  et: {
    headerTitle: 'Töömehe parim sõber!',
    headerSubtitle: 'Häälega juhitav tööriist ehitusplatsile',
    startConversation: 'Alusta vestlust',
    greetingInProgress: 'Tervitus käib...',
    listening: 'Kuulan...',
    sending: 'Saadan...',
    waitingResponse: 'Ootan vastust...',
    playingResponse: 'Mängin vastust...',
    readyForClick: 'Kliki kui oled valmis!',
    startRecording: 'Alusta rääkimist...',
    stopRecording: 'Peatan salvestamise...',
    sendingToServer: 'Saadan serverisse...',
    processingResponse: 'Töötlen vastust...',
    playingAudio: 'Mängin helivastust...',
    readyForNext: 'Valmis järgmiseks küsimuseks!',
    startConversationPrompt: 'Alustan vestlust...',
    greetingPlayed: 'Tervitus mängitud!',
    readyToListen: 'Valmis kuulama!',
    listeningClickWhenReady: 'Kuulan... Kliki uuesti kui oled valmis!',
    processingAudio: 'Helistsõnumi sisu töödeldakse...',
    resetConversation: 'Alusta otsast',
    pressToStart: 'Vajuta mikrofoni vestluse alustamiseks',
    footerText: 'Powered by Tööriistad App v1.0',
    voiceError: 'Viga häälkäskluses',
    tryAgain: 'Proovi uuesti',
    unknownError: 'Tundmatu viga',
    recordingFailed: 'Helisalvestus ebaõnnestus - heli ei tuvastatud',
    noAudioDetected: 'Heli ei tuvastatud'
  },
  en: {
    headerTitle: 'Worker\'s Best Friend!',
    headerSubtitle: 'Voice-controlled tool for construction sites',
    startConversation: 'Start conversation',
    greetingInProgress: 'Greeting in progress...',
    listening: 'Listening...',
    sending: 'Sending...',
    waitingResponse: 'Waiting for response...',
    playingResponse: 'Playing response...',
    readyForClick: 'Click when ready!',
    startRecording: 'Start speaking...',
    stopRecording: 'Stopping recording...',
    sendingToServer: 'Sending to server...',
    processingResponse: 'Processing response...',
    playingAudio: 'Playing audio response...',
    readyForNext: 'Ready for next question!',
    startConversationPrompt: 'Starting conversation...',
    greetingPlayed: 'Greeting played!',
    readyToListen: 'Ready to listen!',
    listeningClickWhenReady: 'Listening... Click again when ready!',
    processingAudio: 'Audio message content being processed...',
    resetConversation: 'Start over',
    pressToStart: 'Press microphone to start conversation',
    footerText: 'Powered by WorkTool App v1.0',
    voiceError: 'Voice command error',
    tryAgain: 'Try again',
    unknownError: 'Unknown error',
    recordingFailed: 'Audio recording failed - no audio detected',
    noAudioDetected: 'No audio detected'
  }
};

export const getTranslations = (language: 'fi' | 'et' | 'en'): Translations => {
  return translations[language];
};
