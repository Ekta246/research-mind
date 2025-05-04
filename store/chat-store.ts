import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  content: string
  role: 'system' | 'user' | 'assistant'
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  chatId: string | null
  isLoading: boolean
  
  // Actions
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setChatId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
  resetChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: "1",
          content: "Hello! I'm your AI research assistant. How can I help with your research today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      chatId: null,
      isLoading: false,
      
      addMessage: (message) => 
        set((state) => ({ messages: [...state.messages, message] })),
      
      setMessages: (messages) => 
        set({ messages }),
      
      setChatId: (chatId) => 
        set({ chatId }),
      
      setIsLoading: (isLoading) => 
        set({ isLoading }),
      
      resetChat: () => 
        set({
          messages: [
            {
              id: "1",
              content: "Hello! I'm your AI research assistant. How can I help with your research today?",
              role: "assistant",
              timestamp: new Date(),
            },
          ],
          chatId: null,
        }),
    }),
    {
      name: 'research-mind-chat',
      // Custom serialization to handle Date objects
      serialize: (state) => JSON.stringify({
        ...state,
        state: {
          ...state.state,
          messages: state.state.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
          }))
        }
      }),
      // Custom deserialization to handle Date objects
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            messages: parsed.state.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
        };
      }
    }
  )
) 