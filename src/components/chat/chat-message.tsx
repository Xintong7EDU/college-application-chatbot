"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Message } from '@/lib/types'
import { MarkdownRenderer } from './markdown-renderer'
import { formatDate, getMessageRole, clientOnly } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PlayVoiceButton } from '@/components/ui/play-voice-button'
import { VoiceSettingsPanel } from '@/components/ui/voice-settings'
import { VoiceSettings } from '@/lib/tts'

// Default voice settings
const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0,
  speed: 1.0,
  use_speaker_boost: true
};

// Simple placeholder for markdown content while loading
const MarkdownPlaceholder = ({ content }: { content: string }) => (
  <p className="whitespace-pre-wrap break-words opacity-70">{content}</p>
);

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(defaultVoiceSettings)
  const [voiceId, setVoiceId] = useState<string>('EXAVITQu4vr4xnSDxMaL') // Default to Cassidy voice
  const [modelId, setModelId] = useState<string>('eleven_multilingual_v2') // Default to Flash v2.5
  
  // Ensure createdAt is a Date object
  const createdAt = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;

  // Format the date on the client side only
  useEffect(() => {
    setIsClient(true)
    setFormattedDate(formatDate(createdAt))
    console.log('ChatMessage client-side hydration complete', message.id)
  }, [createdAt, message.id])

  // IMPORTANT: The container className must be consistent between server and client
  // We must use a fixed string, not dynamic values that would change after hydration
  const containerClassName = "flex w-full items-start gap-4 py-4 " + 
    (isAssistant ? "justify-start" : "justify-end")

  const messageContainerClassName = "flex flex-col gap-2 " + 
    (isAssistant ? "items-start" : "items-end") + 
    " max-w-3xl"

  return (
    <div className={containerClassName}>
      <div className={messageContainerClassName}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getMessageRole(message.role)}</span>
          {/* Always render bullet point with consistent visibility */}
          <span className={isClient ? "inline" : "invisible"}>•</span>
          <time 
            dateTime={createdAt instanceof Date && !isNaN(createdAt.getTime()) 
              ? createdAt.toISOString() 
              : new Date().toISOString()}
            className={isClient ? "inline" : "invisible"}
          >
            {formattedDate}
          </time>
          
          {/* Voice controls only for assistant messages - always render but toggle visibility */}
          {isAssistant && (
            <div className={isClient ? "flex items-center gap-1 ml-1" : "hidden"}>
              <PlayVoiceButton 
                text={message.content}
                voiceId={voiceId}
                modelId={modelId}
                voiceSettings={voiceSettings}
              />
              <VoiceSettingsPanel 
                voiceSettings={voiceSettings}
                onChange={setVoiceSettings}
                onVoiceChange={setVoiceId}
                onModelChange={setModelId}
                defaultVoiceId={voiceId}
                defaultModelId={modelId}
              />
            </div>
          )}
        </div>
        
        <Card className={
          isAssistant 
            ? 'bg-card text-card-foreground px-4 py-3 shadow-sm' 
            : 'bg-primary text-primary-foreground px-4 py-3 shadow-sm'
        }>
          {isAssistant ? (
            isClient ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <MarkdownPlaceholder content={message.content} />
            )
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </Card>
      </div>
    </div>
  )
} 