export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  content: string
  role: MessageRole
  createdAt: Date | string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date | string
  updatedAt: Date | string
} 