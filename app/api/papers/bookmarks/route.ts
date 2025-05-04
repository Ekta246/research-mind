import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Mock user ID for development (replace with auth user ID in production)
const DEV_USER_ID = 'dev-user'

// GET: Retrieve all bookmarks for the user
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Failed to initialize database connection',
        success: false 
      }, { status: 500 })
    }
    
    const { data: papers, error } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching bookmarks:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to fetch bookmarks',
        success: false 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      papers,
      success: true
    })
  } catch (error) {
    console.error('Error in bookmarks GET route:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}

// POST: Toggle bookmark status for a paper
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, isBookmarked } = body
    
    if (!paperId) {
      return NextResponse.json({ 
        error: 'Paper ID is required',
        success: false 
      }, { status: 400 })
    }
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Failed to initialize database connection',
        success: false 
      }, { status: 500 })
    }
    
    // First check if the paper exists in our database
    const { data: existingPaper, error: checkError } = await supabase
      .from('papers')
      .select('is_favorite')
      .eq('id', paperId)
      .maybeSingle()
    
    if (checkError) {
      console.error('Error checking paper exists:', checkError)
      return NextResponse.json({ 
        error: checkError.message || 'Failed to check if paper exists',
        success: false 
      }, { status: 500 })
    }
    
    // Determine the new bookmark status
    let newBookmarkStatus = isBookmarked
    
    // If isBookmarked is not specified, toggle the current status
    if (newBookmarkStatus === undefined && existingPaper) {
      newBookmarkStatus = !existingPaper.is_favorite
    } else if (newBookmarkStatus === undefined) {
      // Default to true if paper doesn't exist and no status specified
      newBookmarkStatus = true
    }
    
    let result
    
    if (existingPaper) {
      // Update existing paper
      const { data, error } = await supabase
        .from('papers')
        .update({ 
          is_favorite: newBookmarkStatus,
          user_id: DEV_USER_ID,
          updated_at: new Date().toISOString()
        })
        .eq('id', paperId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating bookmark status:', error)
        return NextResponse.json({ 
          error: error.message || 'Failed to update bookmark status',
          success: false 
        }, { status: 500 })
      }
      
      result = data
    } else {
      // Create new paper with bookmark status
      const { data, error } = await supabase
        .from('papers')
        .insert({ 
          id: paperId,
          is_favorite: newBookmarkStatus,
          user_id: DEV_USER_ID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating bookmarked paper:', error)
        return NextResponse.json({ 
          error: error.message || 'Failed to create bookmarked paper',
          success: false 
        }, { status: 500 })
      }
      
      result = data
    }
    
    return NextResponse.json({ 
      paper: result,
      success: true
    })
  } catch (error) {
    console.error('Error in bookmarks POST route:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false 
    }, { status: 500 })
  }
} 