import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST: Save a paper to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paper } = body
    
    if (!paper || !paper.title || !paper.abstract) {
      return NextResponse.json({ error: 'Paper data is required' }, { status: 400 })
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // For development, use a fixed user ID
    const devUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' // Valid UUID format
    
    // Format paper data for insertion
    const paperData = {
      id: paper.id || crypto.randomUUID(), // Generate ID if none provided
      title: paper.title,
      abstract: paper.abstract || '',
      year: paper.year || new Date().getFullYear(),
      authors: Array.isArray(paper.authors) 
        ? paper.authors 
        : typeof paper.authors === 'string' 
        ? paper.authors.split(',').map((a: string) => a.trim()) 
        : [],
      url: paper.url || null,
      pdf_url: paper.pdf_url || null,
      source: paper.source || 'custom',
      user_id: devUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_favorite: paper.is_favorite || false,
      tags: paper.tags || []
    }
    
    // Check if paper already exists (by ID)
    const { data: existingPaper, error: checkError } = await supabase
      .from('papers')
      .select('id')
      .eq('id', paperData.id)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error code
      console.error('Error checking if paper exists:', checkError)
      return NextResponse.json({ error: 'Failed to check if paper exists' }, { status: 500 })
    }
    
    let result
    
    // If paper exists, update it
    if (existingPaper) {
      const { data, error: updateError } = await supabase
        .from('papers')
        .update({
          title: paperData.title,
          abstract: paperData.abstract,
          year: paperData.year,
          authors: paperData.authors,
          url: paperData.url,
          pdf_url: paperData.pdf_url,
          updated_at: paperData.updated_at
        })
        .eq('id', paperData.id)
        .select()
      
      if (updateError) {
        console.error('Error updating paper:', updateError)
        return NextResponse.json({ error: 'Failed to update paper' }, { status: 500 })
      }
      
      result = { paper: data, updated: true }
    } 
    // Otherwise, insert new paper
    else {
      const { data, error: insertError } = await supabase
        .from('papers')
        .insert(paperData)
        .select()
      
      if (insertError) {
        console.error('Error inserting paper:', insertError)
        return NextResponse.json({ error: 'Failed to save paper' }, { status: 500 })
      }
      
      result = { paper: data, created: true }
    }
    
    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error: any) {
    console.error('Paper save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save paper' },
      { status: 500 }
    )
  }
} 