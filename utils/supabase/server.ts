import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
import { cache } from 'react'

// Cache the createClient result
export const createClient = cache(async () => {
  const cookieStore = cookies() as unknown as RequestCookies

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing")
    return null
  }

  try {
    new URL(supabaseUrl)
  } catch (urlError) {
    console.error("Invalid Supabase URL format:", urlError)
    return null
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )
})

// Cache auth check results
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  if (!supabase) return null
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error("Error getting auth user:", error)
    return null
  }
  
  return user
})

// Cache session check results
export const getAuthSession = cache(async () => {
  const supabase = await createClient()
  if (!supabase) return null
  
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error("Error getting auth session:", error)
    return null
  }
  
  return session
})
