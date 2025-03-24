"use client"

import { useState, useCallback } from 'react'
import { Headphones, AlertCircle, Settings } from 'lucide-react'
import { Button } from './button'
import { AudioPlayer } from './audio-player'
import { textToSpeech, TTSOptions, VoiceSettings } from '@/lib/tts'
import { toast } from 'sonner'

// Default voice settings based on Eleven Labs UI
const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,     // Middle of the slider
  similarity_boost: 0.75, // Higher similarity (right side of slider)
  style: 0.0,         // Default style value
  speed: 1.0,         // Default speed
  use_speaker_boost: true
};

// Default voice ID for "Cassidy" voice (replace with actual ID if known)
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

// Default model ID for "Eleven Flash v2.5"
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

interface PlayVoiceButtonProps {
  text: string
  className?: string
  voiceId?: string
  modelId?: string
  voiceSettings?: Partial<VoiceSettings>
}

export function PlayVoiceButton({ 
  text, 
  className,
  voiceId = DEFAULT_VOICE_ID,
  modelId = DEFAULT_MODEL_ID,
  voiceSettings = defaultVoiceSettings
}: PlayVoiceButtonProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const handleGenerateVoice = useCallback(async () => {
    try {
      if (audioBlob) {
        // If we already have audio, just expand to show player
        setIsExpanded(true)
        return
      }
      
      setIsLoading(true)
      setIsExpanded(true)
      setHasError(false)
      
      console.log('Generating voice for text:', text.substring(0, 50) + '...');
      
      // Configure TTS options
      const ttsOptions: TTSOptions = {
        voiceId,
        modelId,
        voiceSettings
      };
      
      const blob = await textToSpeech(text, ttsOptions)
      
      if (blob) {
        setAudioBlob(blob)
        console.log('Voice generated successfully, blob size:', Math.round(blob.size / 1024), 'KB');
      } else {
        console.error('Failed to generate voice, received null blob');
        setHasError(true)
        toast.error('Failed to generate voice. Please check the console for details.')
      }
    } catch (error) {
      console.error('Error generating voice:', error);
      setHasError(true)
      toast.error('Error generating voice. Please check the console for details.')
    } finally {
      setIsLoading(false)
    }
  }, [text, audioBlob, voiceId, modelId, voiceSettings])
  
  // If there was an error but the user clicks again, retry
  const handleClick = () => {
    if (hasError) {
      setHasError(false)
      setIsExpanded(false)
      setAudioBlob(null)
    }
    handleGenerateVoice()
  }
  
  return (
    <div className={className}>
      {!isExpanded ? (
        <Button
          variant="ghost" 
          size="icon"
          onClick={handleClick}
          className="h-8 w-8 rounded-full"
          aria-label="Generate voice"
        >
          <Headphones className="h-4 w-4" />
        </Button>
      ) : hasError ? (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="h-8 w-8 rounded-full text-red-500"
            aria-label="Retry voice generation"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <AudioPlayer 
          audioBlob={audioBlob}
          isLoading={isLoading}
          onPlay={() => console.log('Playing audio')}
        />
      )}
    </div>
  )
} 