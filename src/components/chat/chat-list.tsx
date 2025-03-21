"use client"

import React, { useEffect, useRef } from 'react'
import { Message } from '@/lib/types'
import { ChatMessage } from './chat-message'
import { useChatStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export function ChatList() {
  const { getCurrentMessages, isGenerating } = useChatStore()
  const messages = getCurrentMessages()
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Display welcome message if no messages
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to GPT-4o Chat</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Start a conversation with GPT-4o, one of OpenAI's most advanced language models.
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
    <div className="flex-1 overflow-y-auto p-4">
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
    </div>
  )
}

const examplePrompts = [
  "Explain quantum computing in simple terms.",
  "Write a short story about a robot learning to feel emotions.",
  "What are the most effective strategies for tackling climate change?",
  "Help me plan a 7-day itinerary for Japan."
] 