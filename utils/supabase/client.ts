// import { createBrowserClient } from "@supabase/ssr"

// export function createClient() {
//   try {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
//     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//     if (!supabaseUrl || !supabaseAnonKey) {
//       console.error("Supabase environment variables are missing")
//       return null
//     }

//     // Validate URL format before creating client
//     try {
//       // Test if URL is valid
//       new URL(supabaseUrl)
//     } catch (urlError) {
//       console.error("Invalid Supabase URL format:", urlError)
//       return null
//     }

//     return createBrowserClient(supabaseUrl, supabaseAnonKey)
//   } catch (error) {
//     console.error("Error creating Supabase browser client:", error)
//     return null
//   }
// }

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
