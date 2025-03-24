"use client"

import { useState, useCallback } from 'react'
import { Headphones, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { AudioPlayer } from './audio-player'
import { textToSpeech } from '@/lib/tts'
import { toast } from 'sonner'

interface PlayVoiceButtonProps {
  text: string
  className?: string
}

export function PlayVoiceButton({ text, className }: PlayVoiceButtonProps) {
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
      const blob = await textToSpeech(text)
      
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
  }, [text, audioBlob])
  
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