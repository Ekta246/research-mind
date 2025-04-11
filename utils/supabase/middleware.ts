import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Create default response first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Skip Supabase initialization if environment variables are missing or empty
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase environment variables are missing in middleware")
      return response
    }

    // Validate URL format before creating client
    try {
      // Test if URL is valid
      new URL(supabaseUrl)
    } catch (urlError) {
      console.error("Invalid Supabase URL format in middleware:", urlError)
      return response
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    })

    await supabase.auth.getSession()
  } catch (error) {
    console.error("Error in updateSession middleware:", error)
    // Return the default response even if there's an error
  }

  return response
}
