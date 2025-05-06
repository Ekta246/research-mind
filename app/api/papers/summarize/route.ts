// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(request: NextRequest) {
//   try {
//     const { paperContent } = await request.json();
    
//     if (!paperContent) {
//       return NextResponse.json({ error: 'No paper content provided' }, { status: 400 });
//     }
    
//     // Call Ollama API
//     const response = await fetch('http://localhost:11434/api/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'llama3', // or whatever model you have available
//         prompt: `Please provide a concise summary of the following academic paper content. Focus on the main findings, methodology, and significance of the research, you can only focus on abstract and conclusion and if methods and statistics are available in the paper:\n\n${paperContent}`,
//         stream: false
//       }),
//     });
    
//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.status}`);
//     }
    
//     const data = await response.json();
    
//     return NextResponse.json({ 
//       summary: data.response,
//       model: data.model
//     });
//   } catch (error) {
//     console.error('Summarization error:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to summarize paper' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { paperContent } = await request.json();
    
    if (!paperContent) {
      return NextResponse.json({ error: 'No paper content provided' }, { status: 400 });
    }
    
    // Call OpenAI API using the SDK
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a scientific research assistant that specializes in creating concise summaries of academic papers. Please provide a summary of the abstract and conclusion."
        },
        {
          role: "user",
          content: `Please provide a concise summary of the following academic paper content. Focus on the main findings, methodology, and significance of the research: \n\n${paperContent}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    return NextResponse.json({ 
      summary: response.choices[0].message.content,
      model: response.model
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize paper' },
      { status: 500 }
    );
  }
}