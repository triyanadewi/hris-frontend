import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Cek apakah URL mengarah ke /admin
  // if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!token) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
