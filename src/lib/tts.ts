import { Voice } from 'elevenlabs/api';

// Access API key from public runtime config instead of process.env
// API keys should be prefixed with NEXT_PUBLIC_ to be accessible on client
const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || '';
  
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Replace with your desired default voice ID

export async function textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<Blob | null> {
  try {
    console.log('Converting text to speech:', text.substring(0, 50) + '...');
    console.log('API Key available:', !!ELEVEN_LABS_API_KEY);
    
    if (!ELEVEN_LABS_API_KEY) {
      console.error('Eleven Labs API key is not set');
      return null;
    }
    
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    console.log('Making API request to:', apiUrl);
    
    const requestBody = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
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