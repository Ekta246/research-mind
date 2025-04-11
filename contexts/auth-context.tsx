"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)

    const setData = async () => {
      if (!configured) {
        setIsLoading(false)
        return
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth session error:", error)
          setIsLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting auth session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only set up the auth listener if Supabase is configured
    let authListener = { subscription: { unsubscribe: () => {} } }

    if (configured) {
      try {
        authListener = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        })
      } catch (error) {
        console.error("Error setting up auth listener:", error)
        setIsLoading(false)
      }
    }

    setData()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: new Error("Supabase is not properly configured") }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        router.push("/dashboard")
        router.refresh()
      }

      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!isConfigured) {
      return { data: null, error: new Error("Supabase is not properly configured") }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (!error && data?.user) {
        try {
          // Create user profile
          await supabase.from("user_profiles").insert({
            user_id: data.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      }

      return { data, error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error("Sign out error:", error)
      }
    }
    router.push("/")
    router.refresh()
  }

  const value = {
    user,
    session,
    isLoading,
    isConfigured,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
