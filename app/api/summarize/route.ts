import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Import OpenAI directly with require to avoid TypeScript errors
// In production, you should install the proper types
const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, abstract, title } = body
    
    if (!paperId || !abstract) {
      return NextResponse.json({ error: 'Paper ID and abstract are required' }, { status: 400 })
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // Get user information
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if we already have a summary for this paper
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('*')
      .eq('paper_ids', [paperId])
      .single()
    
    if (existingSummary) {
      return NextResponse.json({ 
        summary: existingSummary.content,
        cached: true,
        title: existingSummary.title
      })
    }
    
    // Generate a summary using OpenAI
    const prompt = `
      Title: ${title}
      
      Abstract: ${abstract}
      
      Please provide a concise summary of this research paper that highlights:
      1. The main problem being addressed
      2. The approach/methodology used
      3. The key findings and contributions
      4. The implications or significance of the research
      
      Format the summary in clear paragraphs with no bullet points. Keep it under 250 words.
    `
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a research assistant that produces clear, accurate summaries of academic papers. Focus on the core contributions and key findings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })
    
    const summary = completion.choices[0].message.content?.trim() || "Unable to generate summary."
    
    // Save the summary to the database for future use if user is authenticated
    if (user) {
      const summaryTitle = `Summary of: ${title}`
      
      await supabase.from('summaries').insert({
        content: summary,
        paper_ids: [paperId],
        user_id: user.id,
        title: summaryTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    
    return NextResponse.json({
      summary,
      cached: false,
      title: `Summary of: ${title}`
    })
    
  } catch (error: any) {
    console.error('Summarization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
} 