import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET: List all papers in a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }

    // For development, use a fixed user ID
    const devUserId = '41263bb0-6d56-497f-8f90-2ce1cc0425cd' // Valid UUID format

    // Check if project exists and belongs to user
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', devUserId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Get all papers in the project
    const { data: projectPapers, error: papersError } = await supabase
      .from('project_papers')
      .select(`
        paper_id,
        papers:paper_id (
          id,
          title,
          abstract,
          authors,
          year,
          url,
          is_favorite
        )
      `)
      .eq('project_id', projectId)

    if (papersError) {
      console.error('Error fetching project papers:', papersError)
      return NextResponse.json({ error: 'Failed to fetch project papers' }, { status: 500 })
    }

    // Transform the response to a cleaner format
    const papers = projectPapers.map(item => ({
      ...item.papers,
      project_paper_id: item.paper_id
    }))

    return NextResponse.json({
      success: true,
      project: projectData,
      papers,
      count: papers.length
    })

  } catch (error: any) {
    console.error('Error listing project papers:', error)
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
    const projectId = params.id
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

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

    // For development, use a fixed user ID
    const devUserId = '41263bb0-6d56-497f-8f90-2ce1cc0425cd' // Valid UUID format

    // Check if project exists and belongs to user
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', devUserId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Check if paper exists
    const { data: paperData, error: paperError } = await supabase
      .from('papers')
      .select('id, title')
      .eq('id', paperId)
      .single()

    if (paperError) {
      console.error('Error fetching paper:', paperError)
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    // Check if relation already exists
    const { data: existingRelation, error: relationCheckError } = await supabase
      .from('project_papers')
      .select('id')
      .eq('project_id', projectId)
      .eq('paper_id', paperId)
      .single()

    if (existingRelation) {
      return NextResponse.json({ 
        success: true, 
        message: 'Paper is already in this project',
        alreadyExists: true
      })
    }

    // Add paper to project
    const { data: relation, error: addError } = await supabase
      .from('project_papers')
      .insert({
        project_id: projectId,
        paper_id: paperId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (addError) {
      console.error('Error adding paper to project:', addError)
      return NextResponse.json({ error: 'Failed to add paper to project' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Paper "${paperData.title}" added to project "${projectData.name}"`,
      relation
    })

  } catch (error: any) {
    console.error('Error adding paper to project:', error)
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