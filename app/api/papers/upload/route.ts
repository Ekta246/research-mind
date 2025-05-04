import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Simple UUID generator for development
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    // Initialize the Supabase client
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 })
    }

    // Get authenticated user 
    const { data: { user } } = await supabase.auth.getUser()
    
    // For development, use a fixed user ID if no authenticated user
    const userId = user?.id || 'dev-user'
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const authors = formData.get('authors') as string
    const abstract = formData.get('abstract') as string
    const tags = formData.get('tags') as string
    
    // Validate required fields
    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }
    
    // Generate a unique ID for the paper
    const paperId = generateUUID()
    
    // Upload the file to Supabase Storage
    // In a real implementation, you would upload to Supabase Storage
    // const { data: fileData, error: fileError } = await supabase.storage
    //   .from('papers')
    //   .upload(`${userId}/${paperId}.pdf`, file)
    
    // if (fileError) {
    //   console.error('File upload error:', fileError)
    //   return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    // }
    
    // For development, we'll skip actual file upload and simulate success
    
    // Get the public URL for the uploaded file
    // In a real implementation, you would get the URL from Supabase
    // const fileUrl = supabase.storage.from('papers').getPublicUrl(`${userId}/${paperId}.pdf`).data.publicUrl
    
    // For development, use a mock URL
    const fileUrl = `https://storage.example.com/papers/${paperId}.pdf`
    
    // Process tags
    const tagArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    // Process authors
    const authorArray = authors.split(',')
      .map(author => author.trim())
      .filter(author => author.length > 0)
    
    // Insert paper data into the database
    const { error: dbError } = await supabase
      .from('papers')
      .insert({
        id: paperId,
        user_id: userId,
        title,
        abstract: abstract || 'No abstract provided',
        authors: authorArray,
        year: new Date().getFullYear(), // Default to current year
        tags: tagArray,
        source: 'User Upload',
        url: '',
        pdf_url: fileUrl,
        is_favorite: false,
        citations: 0,
        journal: 'N/A',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save paper data' }, { status: 500 })
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Paper uploaded successfully',
      paperId,
      title,
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload paper' },
      { status: 500 }
    )
  }
} 