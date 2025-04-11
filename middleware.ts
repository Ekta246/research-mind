import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error("Middleware error:", error)
    // Return a default response if updateSession fails
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - public/images (public image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|public/images).*)",
  ],
}
