import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paperContent } = await request.json();
    
    if (!paperContent) {
      return NextResponse.json({ error: 'No paper content provided' }, { status: 400 });
    }
    
    // Call Ollama API
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // or whatever model you have available
        prompt: `Please provide a concise summary of the following academic paper content. Focus on the main findings, methodology, and significance of the research, you can only focus on abstract and conclusion and if methods and statistics are available in the paper:\n\n${paperContent}`,
        stream: false
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({ 
      summary: data.response,
      model: data.model
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize paper' },
      { status: 500 }
    );
  }
}
