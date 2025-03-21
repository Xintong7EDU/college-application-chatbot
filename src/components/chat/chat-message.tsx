"use client"

import React, { useState, useEffect } from 'react'
import { Message } from '@/lib/types'
import { MarkdownRenderer } from './markdown-renderer'
import { formatDate, getMessageRole } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  
  // Ensure createdAt is a Date object
  const createdAt = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;

  // Format the date on the client side only
  useEffect(() => {
    setIsClient(true)
    setFormattedDate(formatDate(createdAt))
  }, [createdAt])

  // The main container div className must be the same on both server and client
  // to avoid hydration mismatch
  const containerClassName = cn(
    'flex w-full items-start gap-4 py-4',
    isAssistant ? 'justify-start' : 'justify-end'
  )

  const messageContainerClassName = cn(
    'flex flex-col gap-2',
    isAssistant ? 'items-start' : 'items-end',
    'max-w-3xl'
  )

  return (
    <div className={containerClassName}>
      <div className={messageContainerClassName}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getMessageRole(message.role)}</span>
          {/* This content is hidden until client-side hydration is complete */}
          <span className={isClient ? "inline" : "hidden"}>•</span>
          <time 
            dateTime={createdAt instanceof Date && !isNaN(createdAt.getTime()) 
              ? createdAt.toISOString() 
              : new Date().toISOString()}
            className={isClient ? "inline" : "hidden"}
          >
            {formattedDate}
          </time>
        </div>
        
        <Card className={cn(
          'px-4 py-3 shadow-sm',
          isAssistant 
            ? 'bg-card text-card-foreground' 
            : 'bg-primary text-primary-foreground'
        )}>
          {isAssistant ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </Card>
      </div>
    </div>
  )
} 