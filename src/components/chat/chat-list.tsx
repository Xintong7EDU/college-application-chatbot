"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Message } from '@/lib/types'
import { ChatMessage } from './chat-message'
import { useChatStore } from '@/lib/store'
import { Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, clientOnly } from '@/lib/utils'

// This component only renders messages when on the client side
export function ChatList() {
  const { getCurrentMessages, isGenerating } = useChatStore()
  const [messages, setMessages] = useState<Message[]>([])
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const prevGeneratingRef = useRef(isGenerating)
  const prevMessagesLengthRef = useRef(0)
  const [isClient, setIsClient] = useState(false)
  
  // Set isClient to true and populate messages only after component mounts on client
  useEffect(() => {
    setIsClient(true)
    
    // Get and sort messages
    const currentMessages = getCurrentMessages().sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      // Handle invalid dates (NaN) by placing them at the end
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      
      return dateA - dateB;
    });
    
    setMessages(currentMessages)
    prevMessagesLengthRef.current = currentMessages.length
    console.log('ChatList client-side hydration complete', currentMessages.length)
  }, [getCurrentMessages])

  // Update messages when they change
  useEffect(() => {
    if (!isClient) return;
    
    const currentMessages = getCurrentMessages().sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      // Handle invalid dates
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      
      return dateA - dateB;
    });

    setMessages(currentMessages);
  }, [getCurrentMessages, isClient]);

  // Only scroll to bottom when generation completes (transitions from true to false)
  useEffect(() => {
    if (!isClient) return; // Skip if not client-side yet
    
    // Check if we just finished generating (from true to false)
    if (prevGeneratingRef.current && !isGenerating) {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    // Update the ref for next check
    prevGeneratingRef.current = isGenerating
  }, [isGenerating, isClient])

  // Scroll to bottom when a new user message is added
  useEffect(() => {
    if (!isClient) return; // Skip if not client-side yet
    
    const messagesIncreased = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    
    // If a new message was added and it's from the user (the last message is from user and we're not generating)
    if (messagesIncreased && messages.length > 0 && messages[messages.length - 1].role === 'user') {
      if (endOfMessagesRef.current) {
        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages.length, messages, isClient]);

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    if (!isClient) return; // Skip if not client-side yet
    
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
  }, [messages.length, isClient])

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Server-side placeholder - won't trigger hydration mismatch since content
  // will be completely replaced on client-side
  if (!isClient) {
    return (
      <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h2 className="text-2xl font-bold mb-2">College Application Assistant</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Loading chatbot...
          </p>
        </div>
      </div>
    )
  }

  // Client-side rendering only
  return (
    <div className="flex-1 overflow-y-auto p-4 relative flex flex-col" ref={containerRef}>
      {/* Welcome section - only shown when there are no messages */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h2 className="text-2xl font-bold mb-2">College Application Assistant</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Get personalized help with your college applications, essays, and more from our AI assistant.
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
      )}
      
      {/* Message list - visible when there are messages */}
      {messages.length > 0 && (
        <div className="flex-1 block">
          {messages.map((message: Message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      )}
        
      {/* Typing indicator */}
      {isGenerating && (
        <div className="flex items-center justify-start p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">GPT-4o is thinking...</span>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={endOfMessagesRef} />

      {/* Scroll to bottom button */}
      <Button
        variant="outline"
        size="icon"
        className={`fixed bottom-24 right-8 rounded-full shadow-md hover:shadow-lg transition-all ${
          showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

const examplePrompts = [
  "What are the key components of a successful college application?",
  "How can I write a compelling personal statement for my college application?",
  "What extracurricular activities should I highlight in my college application?",
  "Can you provide tips for preparing for college interviews?"
] 