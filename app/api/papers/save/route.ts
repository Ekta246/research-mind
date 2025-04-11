import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paper, isFavorite } = body
    
    if (!paper || !paper.id) {
      return NextResponse.json({ error: 'Paper data is required' }, { status: 400 })
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
    
    // Check if paper already exists in user's library
    const { data: existingPaper, error: checkError } = await supabase
      .from('papers')
      .select('id, is_favorite')
      .eq('id', paper.id)
      .eq('user_id', user.id)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the "not found" error
      console.error('Error checking for existing paper:', checkError)
      return NextResponse.json({ error: 'Failed to check if paper exists' }, { status: 500 })
    }
    
    // If the paper exists and we're just toggling favorite status
    if (existingPaper) {
      const { error: updateError } = await supabase
        .from('papers')
        .update({ 
          is_favorite: isFavorite !== undefined ? isFavorite : !existingPaper.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', paper.id)
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('Error updating paper favorite status:', updateError)
        return NextResponse.json({ error: 'Failed to update paper' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true,
        isFavorite: isFavorite !== undefined ? isFavorite : !existingPaper.is_favorite
      })
    }
    
    // If the paper doesn't exist, insert it
    const paperToInsert = {
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      year: paper.year,
      authors: Array.isArray(paper.authors) ? paper.authors : [paper.authors],
      url: paper.url || null,
      pdf_url: paper.pdf_url || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: paper.source || 'External',
      tags: paper.tags || [],
      is_favorite: isFavorite !== undefined ? isFavorite : true,
      notes: null,
      citations: paper.citations || 0,
      journal: paper.journal || null
    }
    
    const { error: insertError } = await supabase
      .from('papers')
      .insert([paperToInsert])
    
    if (insertError) {
      console.error('Error saving paper:', insertError)
      return NextResponse.json({ error: 'Failed to save paper' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      isFavorite: isFavorite !== undefined ? isFavorite : true
    })
    
  } catch (error: any) {
    console.error('Paper save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save paper' },
      { status: 500 }
    )
  }
} 