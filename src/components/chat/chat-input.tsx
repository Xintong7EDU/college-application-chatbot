"use client"

import React, { useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/lib/store'
import { Message } from '@/lib/types'
import { streamOpenAIResponse } from '@/lib/utils'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function ChatInput() {
  const [userInput, setUserInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { 
    addMessage, 
    isGenerating, 
    setIsGenerating, 
    getCurrentMessages, 
    getCurrentSession,
    useSpecialPrompt 
  } = useChatStore()

  // Adjust textarea height based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
    
    // Reset height to auto to get the correct scrollHeight
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userInput.trim() || isGenerating) return
    
    // Clear any previous errors
    setError(null)
    
    const session = getCurrentSession()
    if (!session) return
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: userInput,
      role: 'user',
      createdAt: new Date(),
    }
    
    addMessage(userMessage)
    setUserInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    // Start generating assistant response
    setIsGenerating(true)
    
    try {
      // Create a partial message that will be updated as the response streams in
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: '',
        role: 'assistant',
        createdAt: new Date(),
      }
      
      addMessage(assistantMessage)
      
      // Stream the response
      const messages = [...getCurrentMessages()]
      
      // Note: Remove the last message (assistant's empty message) 
      // since we'll be adding content to it incrementally
      messages.pop()
      
      await streamOpenAIResponse(messages, (chunk) => {
        // Update the assistant message with each chunk
        assistantMessage.content += chunk
        // Update the message with the same ID to avoid duplicates
        addMessage(assistantMessage)
      }, useSpecialPrompt)
    } catch (error) {
      console.error('Error generating response:', error)
      
      // Show error message to the user
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      
      // Also show a toast notification
      toast.error('Error generating response', {
        description: errorMessage,
        duration: 5000,
      })
      
      // Remove the empty assistant message
      const currentMessages = getCurrentMessages()
      if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].role === 'assistant' 
          && currentMessages[currentMessages.length - 1].content === '') {
        // This is a hack - we can't directly remove a message, so we'll update it to be an error message
        const lastMessage = currentMessages[currentMessages.length - 1]
        addMessage({
          ...lastMessage,
          content: `⚠️ Error: ${errorMessage}`,
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full flex-col items-end gap-2 border-t bg-background p-4">
      {error && (
        <div className="mb-2 w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex w-full items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={useSpecialPrompt ? "Type a message... (Using College Counselor)" : "Type a message..."}
          className="min-h-[60px] resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-offset-1"
          disabled={isGenerating}
        />
        <Button type="submit" disabled={!userInput.trim() || isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </div>
    </form>
  )
} 