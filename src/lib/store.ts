import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, ChatSession } from './types'

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string | null
  isGenerating: boolean
  
  // Actions
  setCurrentSessionId: (id: string) => void
  createNewSession: () => void
  addMessage: (message: Message) => void
  updateSessionTitle: (id: string, title: string) => void
  deleteSession: (id: string) => void
  setIsGenerating: (isGenerating: boolean) => void
  getCurrentSession: () => ChatSession | undefined
  getCurrentMessages: () => Message[]
}

// Helper to ensure dates are valid Date objects
const ensureDateObject = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const createEmptySession = (): ChatSession => {
        const timestamp = new Date()
        return {
          id: crypto.randomUUID(),
          title: 'New Conversation',
          messages: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      }

      return {
        sessions: [],
        currentSessionId: null,
        isGenerating: false,

        setCurrentSessionId: (id) => set({ currentSessionId: id }),

        createNewSession: () => {
          const newSession = createEmptySession()
          set((state) => ({
            sessions: [...state.sessions, newSession],
            currentSessionId: newSession.id,
          }))
          return newSession.id
        },

        addMessage: (message) => 
          set((state) => {
            const currentSessionId = state.currentSessionId
            if (!currentSessionId) return state
            
            const sessions = state.sessions.map((session) => {
              if (session.id === currentSessionId) {
                // Ensure message createdAt is a valid Date
                const messageWithValidDate = {
                  ...message,
                  createdAt: ensureDateObject(message.createdAt)
                };
                
                // Check if a message with this ID already exists
                const existingMessageIndex = session.messages.findIndex(m => m.id === message.id);
                
                let updatedMessages;
                if (existingMessageIndex !== -1) {
                  // Update existing message
                  updatedMessages = [...session.messages];
                  updatedMessages[existingMessageIndex] = messageWithValidDate;
                } else {
                  // Add new message
                  updatedMessages = [...session.messages, messageWithValidDate];
                }
                
                return {
                  ...session,
                  messages: updatedMessages,
                  updatedAt: new Date(),
                }
              }
              return session
            })
            
            return { sessions }
          }),

        updateSessionTitle: (id, title) =>
          set((state) => ({
            sessions: state.sessions.map((session) => 
              session.id === id ? { ...session, title } : session
            ),
          })),

        deleteSession: (id) =>
          set((state) => {
            const sessions = state.sessions.filter((session) => session.id !== id)
            const currentSessionId = state.currentSessionId === id
              ? (sessions.length > 0 ? sessions[0].id : null)
              : state.currentSessionId
              
            return { sessions, currentSessionId }
          }),

        setIsGenerating: (isGenerating) => set({ isGenerating }),

        getCurrentSession: () => {
          const { sessions, currentSessionId } = get()
          const session = sessions.find((session) => session.id === currentSessionId)
          
          if (!session) return undefined;
          
          // Ensure dates are valid Date objects
          return {
            ...session,
            createdAt: ensureDateObject(session.createdAt),
            updatedAt: ensureDateObject(session.updatedAt),
            messages: session.messages.map(msg => ({
              ...msg,
              createdAt: ensureDateObject(msg.createdAt)
            }))
          }
        },

        getCurrentMessages: () => {
          const currentSession = get().getCurrentSession()
          return currentSession?.messages || []
        },
      }
    },
    {
      name: 'chat-storage',
    }
  )
) 