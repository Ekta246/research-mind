"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create user profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from("user_profiles").insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
