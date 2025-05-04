import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createProjectSchema, projectResponseSchema } from './schema'
import { ZodError } from 'zod'

// GET: List all projects for the current user
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }
    
    // DEVELOPMENT: Skip authentication check
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    // }
    
    // For development, use a fixed user ID
    // const devUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' // Valid UUID format
    const devUserId = '41263bb0-6d56-497f-8f90-2ce1cc0425cd'
    // Query to get projects
    const { data: projects, error, count } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', devUserId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
    
    // Get count of all projects for the user
    const { count: totalCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', devUserId)
    
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
    
    // Validate request body against schema
    const validatedData = createProjectSchema.parse(body)
    
    // Initialize Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Failed to initialize database connection',
        success: false 
      }, { status: 500 })
    }
    
    // DEVELOPMENT: Skip authentication check and use a fixed user ID
    const devUserId = '41263bb0-6d56-497f-8f90-2ce1cc0425cd'
    
    // Create new project
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        user_id: devUserId,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ 
        error: error.message,
        success: false 
      }, { status: 500 })
    }

    // Validate response data
    const validatedProject = projectResponseSchema.parse(newProject)
    
    return NextResponse.json({
      project: validatedProject,
      success: true
    })
    
  } catch (error) {
    console.error('Project creation error:', error)
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: error.errors[0].message,
        success: false
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create project',
      success: false
    }, { status: 500 })
  }
} 