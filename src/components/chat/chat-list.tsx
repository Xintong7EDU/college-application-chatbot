"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Message } from '@/lib/types'
import { ChatMessage } from './chat-message'
import { useChatStore } from '@/lib/store'
import { Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ChatList() {
  const { getCurrentMessages, isGenerating } = useChatStore()
  const messages = getCurrentMessages()
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const prevGeneratingRef = useRef(isGenerating)
  const prevMessagesLengthRef = useRef(messages.length)

  // Only scroll to bottom when generation completes (transitions from true to false)
  useEffect(() => {
    // Check if we just finished generating (from true to false)
    if (prevGeneratingRef.current && !isGenerating) {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    // Update the ref for next check
    prevGeneratingRef.current = isGenerating
  }, [isGenerating])

  // Scroll to bottom when a new user message is added
  useEffect(() => {
    const messagesIncreased = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    
    // If a new message was added and it's from the user (the last message is from user and we're not generating)
    if (messagesIncreased && messages.length > 0 && messages[messages.length - 1].role === 'user') {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages.length, messages]);

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkScrollPosition = () => {
      // Calculate if we're near the bottom (within 100px)
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setShowScrollButton(!isNearBottom && messages.length > 0)
    }

    container.addEventListener('scroll', checkScrollPosition)
    // Also check when window is resized
    window.addEventListener('resize', checkScrollPosition)
    
    // Initial check
    checkScrollPosition()

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [messages.length])

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Display welcome message if no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to GPT-4o Chat</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start a conversation with GPT-4o, one of OpenAI&apos;s most advanced language models.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {examplePrompts.map((prompt, index) => (
            <div 
              key={index}
              className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                // TODO: Implement clicking on example prompts
              }}
            >
              <p className="text-sm">{prompt}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 relative" ref={containerRef}>
      {messages.map((message: Message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {/* Show typing indicator when generating response */}
      {isGenerating && (
        <div className="flex items-center justify-start p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">GPT-4o is thinking...</span>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={endOfMessagesRef} />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-8 rounded-full shadow-md hover:shadow-lg transition-all"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

const examplePrompts = [
  "What are the key components of a successful college application?",
  "How can I write a compelling personal statement for my college application?",
  "What extracurricular activities should I highlight in my college application?",
  "Can you provide tips for preparing for college interviews?"
] 