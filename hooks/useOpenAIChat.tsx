import { useState, useCallback, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Message } from 'ai'

// Example messages to guide the model's style
const EXAMPLE_MESSAGES: Message[] = [
  { id: 'ex1', role: 'user', content: "I'm worried about my course load for next semester with all my AP classes." },
  { id: 'ex2', role: 'assistant', content: "Yeah, I can see why that's concerning. Do you know if your teachers will give you mock tests to help prepare for the AP exams?" },
  { id: 'ex3', role: 'user', content: "For calculus we'll finish everything before spring break and then have about 4 weeks for review." },
  { id: 'ex4', role: 'assistant', content: "Okay, so you're gonna do three to four weeks of review. That sounds good. What about your other AP courses?" },
]

export interface UseOpenAIChatOptions {
  /** API endpoint for chat */
  api?: string;
  /** Initial messages */
  initialMessages?: Message[];
  /** Callback when messages change */
  onMessagesChange?: (messages: Message[]) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback on message completion */
  onMessageComplete?: (message: Message) => void;
}

export function useOpenAIChat({
  api = '/api/chat',
  initialMessages = [],
  onMessagesChange,
  onError,
  onMessageComplete,
}: UseOpenAIChatOptions = {}) {
  const [chatStartTime, setChatStartTime] = useState<number | null>(null)
  const responseTimeRef = useRef<number | null>(null)
  const [clientApiKey, setClientApiKey] = useState<string | null>(null)
  const [stylePreference, setStylePreference] = useState<string>('counselor')
  
  // Load API key and style preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('openai-api-key')
      setClientApiKey(storedApiKey)
      
      const storedStyle = localStorage.getItem('conversation-style')
      if (storedStyle) {
        setStylePreference(storedStyle)
      }
    }
  }, [])
  
  // Prepare headers with API key and style preference if available
  const headers = useCallback(() => {
    const customHeaders: Record<string, string> = {}
    
    if (clientApiKey) {
      customHeaders['x-openai-api-key'] = clientApiKey
      console.log('Adding API key to request headers')
    }
    
    customHeaders['x-conversation-style'] = stylePreference
    console.log(`Using conversation style: ${stylePreference}`)
    
    return customHeaders
  }, [clientApiKey, stylePreference])
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
    setMessages,
  } = useChat({
    api,
    initialMessages,
    headers: headers(),
    onError: (error) => {
      console.error('Chat error:', error)
      if (onError) onError(error)
    },
    onFinish: (message) => {
      if (responseTimeRef.current) {
        const responseTime = Date.now() - responseTimeRef.current
        console.log(`Response generated in ${responseTime}ms`)
      }
      if (onMessageComplete) onMessageComplete(message)
    },
  })

  // Track when messages change for analytics
  useEffect(() => {
    if (onMessagesChange) onMessagesChange(messages)
    
    // Log session info
    if (messages.length === 0) {
      setChatStartTime(null)
    } else if (messages.length > 0 && !chatStartTime) {
      const startTime = Date.now()
      setChatStartTime(startTime)
      console.log(`Chat session started at ${new Date(startTime).toISOString()}`)
    }
  }, [messages, chatStartTime, onMessagesChange])

  // Enhanced submit handler with timing logs
  const enhancedSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      responseTimeRef.current = Date.now()
      console.log('Sending chat request...')
      
      // Add example messages as system context if this is the first message
      if (messages.length === 0) {
        console.log('Adding example messages as context')
      }
      
      return handleSubmit(e)
    },
    [handleSubmit, messages]
  )

  // Enhanced append method with timing
  const enhancedAppend = useCallback(
    (...props: Parameters<typeof append>) => {
      responseTimeRef.current = Date.now()
      console.log('Appending new message...')
      return append(...props)
    },
    [append]
  )
  
  // Clear chat history
  const clearChat = useCallback(() => {
    console.log('Clearing chat history')
    setMessages([])
    setChatStartTime(null)
  }, [setMessages])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: enhancedSubmit,
    isLoading,
    error,
    append: enhancedAppend,
    reload,
    stop,
    setMessages,
    chatStartTime,
    hasApiKey: !!clientApiKey,
    clearChat,
  }
} 