export interface VoiceState {
  status: 'idle' | 'greeting' | 'recording' | 'sending' | 'waiting' | 'playing';
  isRecording: boolean;
  isPlaying: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  fileUrl?: string; // Uus: faili URL
  fileType?: 'image' | 'pdf' | 'doc' | 'generic' | string; // Uus: faili tüüp (MIME tüüp või laiend)
}

export interface ConversationConfig {
  language: 'fi' | 'et' | 'en';
  webhookUrl: string;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface CameraState {
  isActive: boolean;
  hasPhoto: boolean;
  isUploading: boolean;
  progress: number;
  error: string | null;
}
