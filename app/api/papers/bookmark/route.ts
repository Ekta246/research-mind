import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST: Save/bookmark a paper
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, isFavorite } = body
    
    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // For development, use a fixed user ID
    const devUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' // Valid UUID format
    
    // Check if paper exists
    const { data: existingPaper, error: checkError } = await supabase
      .from('papers')
      .select('id, is_favorite')
      .eq('id', paperId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // Not found error code
      console.error('Error checking paper:', checkError)
      return NextResponse.json({ error: 'Failed to check paper' }, { status: 500 })
    }
    
    console.log("Existing paper:", existingPaper); // Development log
    
    // If paper exists, update its bookmark status
    if (existingPaper) {
      const { error: updateError } = await supabase
        .from('papers')
        .update({ 
          is_favorite: isFavorite !== undefined ? isFavorite : !existingPaper.is_favorite,
          updated_at: new Date().toISOString() 
        })
        .eq('id', paperId)
      
      if (updateError) {
        console.error('Error updating paper bookmark status:', updateError)
        return NextResponse.json({ error: 'Failed to update bookmark status' }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: existingPaper.is_favorite ? 'Paper removed from bookmarks' : 'Paper bookmarked successfully',
        isFavorite: !existingPaper.is_favorite
      })
    } 
    // If paper doesn't exist (unlikely but possible), return error
    else {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    
  } catch (error: any) {
    console.error('Paper bookmark error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bookmark paper' },
      { status: 500 }
    )
  }
} 