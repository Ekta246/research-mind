import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET: List all papers in a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
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
    
    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }
    
    // Fetch project papers
    const { data: projectPapers, error: joinError } = await supabase
      .from('project_papers')
      .select('paper_id')
      .eq('project_id', projectId)
    
    if (joinError) {
      console.error('Error fetching project papers:', joinError)
      return NextResponse.json({ error: 'Failed to fetch project papers' }, { status: 500 })
    }
    
    if (!projectPapers || projectPapers.length === 0) {
      return NextResponse.json({ papers: [], count: 0 })
    }
    
    // Get the actual paper details
    const paperIds = projectPapers.map(item => item.paper_id)
    
    const { data: papers, error: papersError } = await supabase
      .from('papers')
      .select('*')
      .in('id', paperIds)
    
    if (papersError) {
      console.error('Error fetching paper details:', papersError)
      return NextResponse.json({ error: 'Failed to fetch paper details' }, { status: 500 })
    }
    
    return NextResponse.json({
      papers: papers || [],
      count: papers?.length || 0,
      project
    })
    
  } catch (error: any) {
    console.error('Project papers error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list project papers' },
      { status: 500 }
    )
  }
}

// POST: Add a paper to a project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json()
    const { paperId } = body
    
    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
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
    
    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }
    
    // Verify the paper exists and belongs to the user
    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .select('*')
      .eq('id', paperId)
      .eq('user_id', user.id)
      .single()
    
    if (paperError || !paper) {
      return NextResponse.json({ error: 'Paper not found or access denied' }, { status: 404 })
    }
    
    // Check if paper is already in the project
    const { data: existingJoin, error: checkError } = await supabase
      .from('project_papers')
      .select('*')
      .eq('project_id', projectId)
      .eq('paper_id', paperId)
      .single()
    
    if (existingJoin) {
      return NextResponse.json({ 
        success: true,
        message: 'Paper is already in this project',
        alreadyExists: true
      })
    }
    
    // Add paper to project
    const { data: projectPaper, error: joinError } = await supabase
      .from('project_papers')
      .insert({
        project_id: projectId,
        paper_id: paperId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (joinError) {
      console.error('Error adding paper to project:', joinError)
      return NextResponse.json({ error: 'Failed to add paper to project' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      projectPaper
    })
    
  } catch (error: any) {
    console.error('Add paper to project error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add paper to project' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a paper from a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const searchParams = request.nextUrl.searchParams
    const paperId = searchParams.get('paper_id')
    
    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
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
    
    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }
    
    // Remove paper from project
    const { error: deleteError } = await supabase
      .from('project_papers')
      .delete()
      .eq('project_id', projectId)
      .eq('paper_id', paperId)
    
    if (deleteError) {
      console.error('Error removing paper from project:', deleteError)
      return NextResponse.json({ error: 'Failed to remove paper from project' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Paper removed from project'
    })
    
  } catch (error: any) {
    console.error('Remove paper from project error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove paper from project' },
      { status: 500 }
    )
  }
} 