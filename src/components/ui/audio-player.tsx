"use client"

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  audioBlob: Blob | null
  isLoading?: boolean
  onPlay?: () => void
  className?: string
}

export function AudioPlayer({ 
  audioBlob, 
  isLoading = false, 
  onPlay,
  className 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create a URL for the audio blob when it changes
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      // Clean up function to release the URL object
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setAudioUrl(null)
    }
  }, [audioBlob])

  // Handle audio end event
  useEffect(() => {
    const audioElement = audioRef.current
    
    const handleEnded = () => {
      setIsPlaying(false)
    }
    
    if (audioElement) {
      audioElement.addEventListener('ended', handleEnded)
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioRef])

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      if (onPlay) onPlay()
    }
    
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          className="hidden"
        />
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        disabled={!audioUrl || isLoading}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="h-8 w-8 rounded-full"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        disabled={!audioUrl}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="h-8 w-8 rounded-full"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
} 