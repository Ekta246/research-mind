import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET: List all projects for the current user
export async function GET(request: NextRequest) {
  try {
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
    
    // Query to get projects
    const { data: projects, error, count } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
    
    // Get count of all projects for the user
    const { count: totalCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (countError) {
      console.error('Error counting projects:', countError)
    }
    
    return NextResponse.json({
      projects,
      count: projects.length,
      total: totalCount || 0,
    })
    
  } catch (error: any) {
    console.error('Project list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list projects' },
      { status: 500 }
    )
  }
}

// POST: Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
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
    
    // Create new project
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        name,
        description: description || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
    
    return NextResponse.json({
      project: newProject,
      success: true
    })
    
  } catch (error: any) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
} 