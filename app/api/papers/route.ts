import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Paper } from "@/types/paper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get("id");
    
    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if paper exists in our database
    let { data: existingPaper, error } = await supabase
      .from("papers")
      .select("*")
      .eq("id", paperId)
      .single();
    
    if (error && error.code !== "PGRST116") {
      console.error("Error checking paper exists:", error);
      return NextResponse.json(
        { error: "Failed to check if paper exists" },
        { status: 500 }
      );
    }
    
    if (existingPaper) {
      return NextResponse.json({ paper: existingPaper });
    } else {
      // The paper doesn't exist in our database yet
      return NextResponse.json(
        { error: "Paper not found in database" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in papers GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paper } = body;
    
    if (!paper || !paper.id || !paper.title) {
      return NextResponse.json(
        { error: "Paper data is required (id and title at minimum)" },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // First check if the paper already exists
    const { data: existingPaper, error: checkError } = await supabase
      .from("papers")
      .select("id")
      .eq("id", paper.id)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing paper:", checkError);
      return NextResponse.json(
        { error: "Failed to check if paper exists" },
        { status: 500 }
      );
    }
    
    let result;
    
    if (existingPaper) {
      // Update existing paper
      const { data, error } = await supabase
        .from("papers")
        .update({
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          year: paper.year,
          journal: paper.journal || null,
          citations: paper.citations || 0,
          url: paper.url || null,
          pdf_url: paper.pdf_url || null,
          is_favorite: paper.is_favorite !== undefined ? paper.is_favorite : false,
          updated_at: new Date().toISOString()
        })
        .eq("id", paper.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating paper:", error);
        return NextResponse.json(
          { error: "Failed to update paper" },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Insert new paper
      const { data, error } = await supabase
        .from("papers")
        .insert({
          id: paper.id,
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          year: paper.year,
          journal: paper.journal || null,
          citations: paper.citations || 0,
          url: paper.url || null,
          pdf_url: paper.pdf_url || null,
          is_favorite: paper.is_favorite !== undefined ? paper.is_favorite : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error saving paper:", error);
        return NextResponse.json(
          { error: "Failed to save paper" },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({ paper: result });
  } catch (error) {
    console.error("Error in papers POST route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 