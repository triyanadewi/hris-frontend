import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // Ambil cookie 'laravel_session'
  const sessionCookie = request.cookies.get("laravel_session");

  // Jika akses ke /admin tanpa session cookie, redirect ke /signin
  if (isAdminPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
