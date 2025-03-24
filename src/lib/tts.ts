import { Voice } from 'elevenlabs/api';

// Access API key from public runtime config instead of process.env
// API keys should be prefixed with NEXT_PUBLIC_ to be accessible on client
const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || '';

// Default voice settings
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Replace with your desired default voice ID
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2'; // Default model
const DEFAULT_STABILITY = 0.5; // Mid-point stability (0-1)
const DEFAULT_SIMILARITY = 0.75; // Higher similarity value
const DEFAULT_SPEED = 1.0; // Normal speed

// Define interfaces for voice settings
export interface VoiceSettings {
  stability: number; // 0-1: Less stable (more variable) to more stable
  similarity_boost: number; // 0-1: Less similar to more similar to the voice
  style: number; // 0-1: Default is undefined, controls speaking style intensity
  use_speaker_boost?: boolean; // Whether to use speaker boost
  speed?: number; // Speech speed, default is 1.0
}

export interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: Partial<VoiceSettings>;
}

export async function textToSpeech(
  text: string, 
  options?: TTSOptions
): Promise<Blob | null> {
  try {
    console.log('Converting text to speech:', text.substring(0, 50) + '...');
    console.log('API Key available:', !!ELEVEN_LABS_API_KEY);
    
    if (!ELEVEN_LABS_API_KEY) {
      console.error('Eleven Labs API key is not set');
      return null;
    }
    
    const voiceId = options?.voiceId || DEFAULT_VOICE_ID;
    const modelId = options?.modelId || DEFAULT_MODEL_ID;
    
    // Merge default voice settings with provided options
    const voiceSettings: VoiceSettings = {
      stability: options?.voiceSettings?.stability ?? DEFAULT_STABILITY,
      similarity_boost: options?.voiceSettings?.similarity_boost ?? DEFAULT_SIMILARITY,
      style: options?.voiceSettings?.style ?? 0,
      use_speaker_boost: options?.voiceSettings?.use_speaker_boost ?? true,
      speed: options?.voiceSettings?.speed ?? DEFAULT_SPEED,
    };
    
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    console.log('Making API request to:', apiUrl);
    console.log('Using voice settings:', voiceSettings);
    
    const requestBody = {
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Could not parse error response', status: response.status };
      }
      console.error('Eleven Labs API error:', errorData);
      return null;
    }

    const audioBlob = await response.blob();
    console.log('Successfully generated audio blob of size:', Math.round(audioBlob.size / 1024), 'KB');
    return audioBlob;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return null;
  }
}

// Get all available voices from Eleven Labs
export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    console.log('Fetching available voices from Eleven Labs API');
    console.log('API Key available:', !!ELEVEN_LABS_API_KEY);
    
    if (!ELEVEN_LABS_API_KEY) {
      console.error('Eleven Labs API key is not set');
      return [];
    }
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Could not parse error response', status: response.status };
      }
      console.error('Error fetching voices:', errorData);
      return [];
    }

    const data = await response.json();
    console.log(`Retrieved ${data.voices?.length || 0} voices from Eleven Labs API`);
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}

// Get available models from Eleven Labs
export async function getAvailableModels() {
  try {
    console.log('Fetching available models from Eleven Labs API');
    
    if (!ELEVEN_LABS_API_KEY) {
      console.error('Eleven Labs API key is not set');
      return [];
    }
    
    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Could not parse error response', status: response.status };
      }
      console.error('Error fetching models:', errorData);
      return [];
    }

    const data = await response.json();
    console.log(`Retrieved ${data.models?.length || 0} models from Eleven Labs API`);
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
} 