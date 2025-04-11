import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const favoritesOnly = searchParams.get('favorites_only') === 'true'
    
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
    
    // Query to get papers
    let query = supabase
      .from('papers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    // Add favorites filter if needed
    if (favoritesOnly) {
      query = query.eq('is_favorite', true)
    }
    
    // Add pagination
    query = query.range(offset, offset + limit - 1)
    
    // Execute the query
    const { data: papers, error, count } = await query
    
    if (error) {
      console.error('Error fetching papers:', error)
      return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 })
    }
    
    // Get count of all papers for the user
    const { count: totalCount, error: countError } = await supabase
      .from('papers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (countError) {
      console.error('Error counting papers:', countError)
    }
    
    // Get count of favorite papers
    const { count: favoriteCount, error: favoriteCountError } = await supabase
      .from('papers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_favorite', true)
    
    if (favoriteCountError) {
      console.error('Error counting favorite papers:', favoriteCountError)
    }
    
    return NextResponse.json({
      papers,
      count: papers.length,
      total: totalCount || 0,
      favorites: favoriteCount || 0,
      offset,
      limit,
    })
    
  } catch (error: any) {
    console.error('Paper list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list papers' },
      { status: 500 }
    )
  }
} 