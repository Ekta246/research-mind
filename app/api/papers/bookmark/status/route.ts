import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Mock user ID for development (replace with auth user ID in production)
const DEV_USER_ID = 'dev-user'

// GET: Check if a paper is bookmarked
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const paperId = url.searchParams.get('paperId')
    
    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if paper is bookmarked
    const { data, error } = await supabase
      .from('papers')
      .select('is_favorite')
      .eq('id', paperId)
      .eq('user_id', DEV_USER_ID)
      .maybeSingle()
    
    if (error) {
      console.error('Error checking bookmark status:', error)
      return NextResponse.json({ error: 'Failed to check bookmark status' }, { status: 500 })
    }
    
    // Return bookmarked status (true if found and is_favorite is true, false otherwise)
    return NextResponse.json({
      isBookmarked: data?.is_favorite === true
    })
  } catch (error: any) {
    console.error('Error in bookmark status route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 