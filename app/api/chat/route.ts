import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Import OpenAI directly with require to avoid TypeScript errors
// In production, you should install the proper types
const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Type for chat messages
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, chatId } = body
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // Get user information
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }
    
    // Add a system message if not already present
    let chatMessages: ChatMessage[] = [...messages]
    if (!chatMessages.some(msg => msg.role === 'system')) {
      chatMessages.unshift({
        role: 'system',
        content: 'You are a helpful research assistant specializing in academic papers and scientific research. Help users understand complex research topics, find relevant papers, and explain scientific concepts clearly Also, give other sources to the user if you don\'t have the answer to the query'
        
      })
    }
    
    // Generate a response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    
    // Extract the assistant's response
    const assistantResponse = completion.choices[0].message
    
    // Store in chat history
    if (chatId) {
      // Update existing chat
      await supabase
        .from('chat_history')
        .update({
          messages: [...messages, assistantResponse],
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
    } else {
      // Create new chat
      const chatTitle = messages[0]?.content.substring(0, 50) + '...'
      const { data: newChat } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          messages: [...messages, assistantResponse],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: chatTitle
        })
        .select('id')
        .single()
        
      if (newChat) {
        return NextResponse.json({
          message: assistantResponse,
          chatId: newChat.id
        })
      }
    }
    
    return NextResponse.json({
      message: assistantResponse,
      chatId
    })
    
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
} 