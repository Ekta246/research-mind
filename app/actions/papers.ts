"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function savePaper(paper: any) {
  try {
    const supabase = createClient()
    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Check if paper already exists
    const { data: existingPaper } = await supabase
      .from("papers")
      .select("id, is_favorite")
      .eq("id", paper.id)
      .eq("user_id", user.id)
      .single()

    if (existingPaper) {
      // Toggle favorite status
      const { error } = await supabase
        .from("papers")
        .update({ is_favorite: !existingPaper.is_favorite })
        .eq("id", paper.id)
        .eq("user_id", user.id)

      if (error) throw error
    } else {
      // Insert new paper
      const { error } = await supabase.from("papers").insert({
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        year: paper.year,
        authors: Array.isArray(paper.authors) ? paper.authors : paper.authors.split(", "),
        url: paper.url,
        pdf_url: paper.pdf_url,
        source: paper.source,
        tags: paper.tags,
        is_favorite: true,
        user_id: user.id,
      })

      if (error) throw error
    }

    revalidatePath("/dashboard/library")
    return { success: true }
  } catch (error) {
    console.error("Error saving paper:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getSavedPapers() {
  try {
    const supabase = createClient()
    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting saved papers:", error)
    return { success: false, error: (error as Error).message, data: [] }
  }
}
