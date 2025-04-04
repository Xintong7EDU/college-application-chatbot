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
    
    // Use a consistent format that doesn't depend on locale settings
    // This avoids hydration mismatches between server and client locale
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dateObj.getMonth()]
    const day = dateObj.getDate()
    let hours = dateObj.getHours()
    const minutes = dateObj.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`
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
  let controller: AbortController | null = new AbortController();
  
  try {
    console.log('Starting OpenAI response stream...');
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formatMessageToOpenAI(messages),
        useSpecialPrompt,
      }),
      signal: controller.signal,
    });

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

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    let done = false;
    let text = '';

    while (!done) {
      try {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk.length, 'bytes');
        text += chunk;
        onChunk(chunk);
      } catch (readError) {
        console.error('Error reading from stream:', readError);
        done = true;
        throw readError;
      }
    }

    // Final decode to flush any remaining content
    const final = decoder.decode();
    if (final) {
      text += final;
      onChunk(final);
    }

    console.log('Stream completed successfully');
    return text;
  } catch (error) {
    console.error('Error streaming response:', error);
    throw error;
  } finally {
    // Clean up
    if (controller) {
      controller = null;
    }
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

/**
 * Creates a className that safely handles server/client rendering differences
 * to prevent hydration mismatches in Next.js components.
 * 
 * - Use this for ANY element that might render differently between server and client
 * - Applies base classes on both server and client
 * - Applies client-only classes only after hydration
 * - Ensures DOM structure stays identical in both environments
 * 
 * @example
 * // Before: This causes hydration errors
 * {isClient && <div>Client-only content</div>}
 * 
 * // After: This prevents hydration errors
 * <div className={clientOnly("base-class", isClient ? "visible" : "invisible")}>
 *   Client-only content
 * </div>
 */
export function clientOnly(baseClasses: string, clientClasses: string = "") {
  return cn(baseClasses, clientClasses)
}
