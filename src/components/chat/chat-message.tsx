"use client"

import React from 'react'
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
  
  return (
    <div className={cn(
      'flex w-full items-start gap-4 py-4',
      isAssistant ? 'justify-start' : 'justify-end'
    )}>
      <div className={cn(
        'flex flex-col gap-2',
        isAssistant ? 'items-start' : 'items-end',
        'max-w-3xl'
      )}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getMessageRole(message.role)}</span>
          <span>•</span>
          <time dateTime={message.createdAt.toISOString()}>
            {formatDate(message.createdAt)}
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