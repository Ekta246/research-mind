import { NextRequest, NextResponse } from "next/server";


export function middleware(request: NextRequest) {
  // You can add lightweight logic here if needed, but for now, just pass the request through.
  return NextResponse.next();
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
