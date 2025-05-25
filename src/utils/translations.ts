interface Translations {
  headerTitle: string;
  customHeaderTitle?: string; // Added new optional key for the specific title
  headerSubtitle: string;
  footerText: string;
  resetConversation: string;
  startConversationPrompt: string;
  greetingPlayed: string;
  readyToListen: string;
  startRecording: string;
  stopRecording: string;
  sendingToServer: string;
  processingResponse: string;
  playingAudio: string;
  readyForNext: string;
  pressToStart: string;
  processingAudio: string;
  voiceError: string;
  recordingFailed: string;
  tryAgain: string;
  unknownError: string;
  listeningClickWhenReady: string;
  
  // File upload translations
  files: string;
  voice: string;
  camera: string;
  selectFile: string;
  uploadFile: string;
  uploading: string;
  noFileSelected: string;
  pleaseSelectFile: string;
  fileUploaded: string;
  fileUploadedSuccess: string;
  uploadError: string;
  
  // Camera translations
  startCamera: string;
  stopCamera: string;
  takePhoto: string;
  retake: string;
  uploadPhoto: string;
  photoUploaded: string;
  photoUploadedSuccess: string;
  cameraError: string;
  cameraPerm: string;
  cameraOff: string;
}

const fiTranslations: Translations = {
  headerTitle: 'Työkalu App', // This can remain as a general title if used elsewhere
  customHeaderTitle: 'Älykästä apua työmaille', // New specific title
  headerSubtitle: 'Ääniohjattu avustaja rakennustyömaan työntekijöille',
  footerText: '© 2025 Työkalu Team',
  resetConversation: 'Aloita alusta',
  startConversationPrompt: 'Tervetuloa! Paina painiketta puhuaksesi.',
  greetingPlayed: 'Tervetuloa! Järjestelmä on valmiina.',
  readyToListen: 'Valmiina kuuntelemaan.',
  startRecording: 'Aloitan nauhoituksen...',
  stopRecording: 'Nauhoitus pysäytetty.',
  sendingToServer: 'Käsitellään viestiäsi...',
  processingResponse: 'Valmistellaan vastausta...',
  playingAudio: 'Toistetaan äänivastausta...',
  readyForNext: 'Valmis uuteen kysymykseen.',
  pressToStart: 'Paina nappia aloittaaksesi keskustelun',
  processingAudio: 'Käsitellään puheviestiäsi...',
  voiceError: 'Äänivirhe',
  recordingFailed: 'Nauhoitus epäonnistui',
  tryAgain: 'Yritä uudestaan',
  unknownError: 'Tuntematon virhe',
  listeningClickWhenReady: 'Kuuntelen... Paina painiketta kun olet valmis.',
  
  // File upload translations
  files: "Tiedostot",
  voice: "Ääni",
  camera: "Kamera",
  selectFile: "Valitse tiedosto",
  uploadFile: "Lähetä tiedosto",
  uploading: "Lähetetään...",
  noFileSelected: "Ei tiedostoa valittu",
  pleaseSelectFile: "Valitse tiedosto lähetettäväksi",
  fileUploaded: "Tiedosto lähetetty",
  fileUploadedSuccess: "Tiedosto lähetettiin onnistuneesti",
  uploadError: "Lähetysvirhe",
  
  // Camera translations
  startCamera: "Käynnistä kamera",
  stopCamera: "Sammuta kamera",
  takePhoto: "Ota kuva",
  retake: "Ota uusi kuva",
  uploadPhoto: "Lähetä kuva",
  photoUploaded: "Kuva lähetetty",
  photoUploadedSuccess: "Kuva lähetettiin onnistuneesti",
  cameraError: "Kameravirhe",
  cameraPerm: "Kameran käyttöoikeutta ei saatu. Anna sovellukselle lupa käyttää kameraa.",
  cameraOff: "Kamera ei ole päällä"
};

const etTranslations: Translations = {
  headerTitle: 'Tööriista rakendus',
  customHeaderTitle: 'Nutikas abi ehitusplatsidele', // Estonian translation
  headerSubtitle: 'Häälkäsklustega abiline ehitustöötajatele',
  footerText: '© 2025 Tööriista meeskond',
  resetConversation: 'Alusta algusest',
  startConversationPrompt: 'Tere tulemast! Vajuta nuppu, et rääkida.',
  greetingPlayed: 'Tere tulemast! Süsteem on valmis.',
  readyToListen: 'Valmis kuulama.',
  startRecording: 'Alustan salvestamist...',
  stopRecording: 'Salvestamine peatatud.',
  sendingToServer: 'Töötlen teie sõnumit...',
  processingResponse: 'Valmistan vastust...',
  playingAudio: 'Mängin häälvastust...',
  readyForNext: 'Valmis järgmiseks küsimuseks.',
  pressToStart: 'Vestluse alustamiseks vajuta nuppu',
  processingAudio: 'Töötlen teie häälsõnumit...',
  voiceError: 'Häälviga',
  recordingFailed: 'Salvestamine ebaõnnestus',
  tryAgain: 'Proovi uuesti',
  unknownError: 'Tundmatu viga',
  listeningClickWhenReady: 'Kuulan... Vajuta nuppu, kui oled valmis.',
  
  // File upload translations
  files: "Failid",
  voice: "Hääl",
  camera: "Kaamera",
  selectFile: "Vali fail",
  uploadFile: "Saada fail",
  uploading: "Saadan...",
  noFileSelected: "Faili pole valitud",
  pleaseSelectFile: "Vali fail üleslaadimiseks",
  fileUploaded: "Fail saadetud",
  fileUploadedSuccess: "Fail edukalt saadetud",
  uploadError: "Saatmisviga",
  
  // Camera translations
  startCamera: "Käivita kaamera",
  stopCamera: "Peata kaamera",
  takePhoto: "Tee pilt",
  retake: "Tee uus pilt",
  uploadPhoto: "Saada pilt",
  photoUploaded: "Pilt saadetud",
  photoUploadedSuccess: "Pilt edukalt saadetud",
  cameraError: "Kaamera viga",
  cameraPerm: "Ei saanud kaamera kasutusõigust. Palun luba rakendusel kaamerat kasutada.",
  cameraOff: "Kaamera pole sisse lülitatud"
};

const enTranslations: Translations = {
  headerTitle: 'Tool App',
  customHeaderTitle: 'Smart help for construction sites', // English translation
  headerSubtitle: 'Voice-controlled assistant for construction workers',
  footerText: '© 2025 Tool App Team',
  resetConversation: 'Start over',
  startConversationPrompt: 'Welcome! Press the button to speak.',
  greetingPlayed: 'Welcome! System is ready.',
  readyToListen: 'Ready to listen.',
  startRecording: 'Starting recording...',
  stopRecording: 'Recording stopped.',
  sendingToServer: 'Processing your message...',
  processingResponse: 'Preparing response...',
  playingAudio: 'Playing voice response...',
  readyForNext: 'Ready for next question.',
  pressToStart: 'Press button to start conversation',
  processingAudio: 'Processing your voice message...',
  voiceError: 'Voice Error',
  recordingFailed: 'Recording failed',
  tryAgain: 'Try again',
  unknownError: 'Unknown error',
  listeningClickWhenReady: 'Listening... Press button when you\'re done.',
  
  // File upload translations
  files: "Files",
  voice: "Voice",
  camera: "Camera",
  selectFile: "Select file",
  uploadFile: "Upload file",
  uploading: "Uploading...",
  noFileSelected: "No file selected",
  pleaseSelectFile: "Please select a file to upload",
  fileUploaded: "File uploaded",
  fileUploadedSuccess: "File was uploaded successfully",
  uploadError: "Upload Error",
  
  // Camera translations
  startCamera: "Start camera",
  stopCamera: "Stop camera",
  takePhoto: "Take photo",
  retake: "Retake",
  uploadPhoto: "Upload photo",
  photoUploaded: "Photo uploaded",
  photoUploadedSuccess: "Photo was uploaded successfully",
  cameraError: "Camera Error",
  cameraPerm: "Could not access the camera. Please grant permission.",
  cameraOff: "Camera is off"
};

export const getTranslations = (language: 'fi' | 'et' | 'en'): Translations => {
  switch (language) {
    case 'fi':
      return fiTranslations;
    case 'et':
      return etTranslations;
    case 'en':
      return enTranslations;
    default:
      return fiTranslations;
  }
};
