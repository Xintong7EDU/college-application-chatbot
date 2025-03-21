import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { useChat } from 'ai/react'
import { Message } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

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

interface MarkdownProps {
  children: ReactNode;
}

interface CodeProps extends MarkdownProps {
  inline?: boolean;
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

  // Process markdown in messages
  const markdownComponents: Partial<Components> = {
    p: ({children}) => <p className="mb-4">{children}</p>,
    h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
    ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
    ol: ({children}) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    li: ({children}) => <li className="mb-2">{children}</li>,
    strong: ({children}) => <strong className="font-bold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    code: ({node, inline, ...props}) => 
      inline ? 
        <code className="bg-gray-100 rounded px-1" {...props} /> :
        <code className="block bg-gray-100 p-4 rounded mb-4" {...props} />
  }

  const processedMessages = messages.map(message => ({
    ...message,
    content: message.role === 'assistant' && typeof message.content === 'string' ? 
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {message.content}
      </ReactMarkdown> 
      : message.content
  }))

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
    messages: processedMessages,
    rawMessages: messages,
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