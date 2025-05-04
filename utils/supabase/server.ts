// import { createServerClient } from "@supabase/ssr"
// import { cookies } from "next/headers"
// import type { Database } from "@/types/supabase"
// import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
// import { cache } from 'react'
// import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// // For development - completely bypass auth
// export const createClient = cache(async () => {
//   // Create a direct client with anon key for development
//   try {
//     return createSupabaseClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     )
//   } catch (error) {
//     console.error("Error creating Supabase client:", error)
//     return null
//   }
// })

// // // Cache auth check results
// // export const getAuthUser = cache(async () => {
// //   // For development, return mock user
// //   return {
// //     id: 'dev-user',
// //     email: 'dev@example.com',
// //     // Add any other user properties your app needs
// //   }
// // })

// // // Cache session check results
// // export const getAuthSession = cache(async () => {
// //   // For development, return mock session
// //   return {
// //     user: {
// //       id: 'dev-user',
// //       email: 'dev@example.com',
// //     },
// //     // Add any other session properties your app needs
// //   }
// // })
// export const getAuthUser = cache(async (userId: string) => {
//   if (userId === 'dev-user') {
//     // Return mock user for development
//     return {
//       id: 'dev-user',
//       email: 'dev@example.com',
//     };
//   }

//   // Fetch real user data from your database or authentication provider
//   const user = await fetchUserFromDatabase(userId);
//   return user;
// });

// // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// // const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// async function fetchUserFromDatabase(userId: string) {
//   const supabase = await createClient();
//   if (!supabase) {
//     console.error('Supabase client not initialized');
//     return null;
//   }

//   const { data, error } = await supabase
//     .from('users')
//     .select('*')
//     .eq('id', userId)
//     .single();

//   if (error) {
//     console.error('Error fetching user:', error);
//     return null;
//   }

//   return data;
// }

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}