import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a safer version of the Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Function to get or create the Supabase client
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  // Only try to create the client if both URL and key are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Skip URL validation and just check if the values exist
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
    }
  } else {
    console.error("Supabase environment variables are missing. Authentication and database features will not work.")
  }

  return supabaseInstance
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  try {
    // Simple check if environment variables exist
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  } catch (error) {
    console.error("Error checking Supabase configuration:", error)
    return false
  }
}

// For backward compatibility
export const supabase = {
  auth: {
    getSession: async () => {
      const client = getSupabaseClient()
      if (!client) return { data: { session: null }, error: new Error("Supabase client not initialized") }
      return client.auth.getSession()
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const client = getSupabaseClient()
      if (!client) return { data: { user: null, session: null }, error: new Error("Supabase client not initialized") }
      return client.auth.signInWithPassword(credentials)
    },
    signUp: async (credentials: { email: string; password: string }) => {
      const client = getSupabaseClient()
      if (!client) return { data: { user: null, session: null }, error: new Error("Supabase client not initialized") }
      return client.auth.signUp(credentials)
    },
    signOut: async () => {
      const client = getSupabaseClient()
      if (!client) return { error: new Error("Supabase client not initialized") }
      return client.auth.signOut()
    },
    onAuthStateChange: (callback: any) => {
      const client = getSupabaseClient()
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } }
      return client.auth.onAuthStateChange(callback)
    },
  },
  from: (table: string) => {
    const client = getSupabaseClient()
    if (!client) {
      // Return a dummy object that won't crash but won't work either
      return {
        insert: () => Promise.resolve({ error: new Error("Supabase client not initialized") }),
        select: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized") }),
        }),
        // Add other methods as needed
      }
    }
    return client.from(table)
  },
}
