import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Message, MessageRole } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  try {
    // Handle both Date objects and string dates
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date)
      return 'Just now'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Just now'
  }
}

export function formatMessageToOpenAI(messages: Message[]) {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
  }))
}

export async function streamOpenAIResponse(messages: Message[], onChunk: (chunk: string) => void, useSpecialPrompt: boolean = true) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formatMessageToOpenAI(messages),
        useSpecialPrompt,
      }),
    })

    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson && typeof errorJson === 'object' && 'message' in errorJson) {
          errorMessage = `Error: ${errorJson.message}`;
        } else if (typeof errorJson === 'string') {
          errorMessage = `Error: ${errorJson}`;
        }
      } catch {
        // If response isn't JSON, try to get it as text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `Error: ${errorText}`;
          }
        } catch {
          // If we can't get response as text either, use the default error message
        }
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is null')
    }

    let done = false
    let text = ''

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      text += chunk
      onChunk(chunk)
    }

    return text
  } catch (error) {
    console.error('Error streaming response:', error)
    throw error
  }
}

export function getMessageRole(role: MessageRole) {
  switch (role) {
    case 'user':
      return 'You'
    case 'assistant':
      return 'Assistant'
    case 'system':
      return 'System'
    default:
      return 'Unknown'
  }
}

export function truncateString(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateSessionTitle(content: string) {
  return truncateString(content, 30) || 'New Conversation'
}
