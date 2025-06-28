import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Daftar halaman yang tidak memerlukan autentikasi
  const publicPaths = [
    "/",
    "/signin",
    "/signup", 
    "/user/checkclock",
    "/user/checkclock/add-checkclock",
    // Tambahkan path lain yang ingin diakses tanpa login
  ];

  // Cek apakah path saat ini adalah public path
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Jika halaman publik, lewati pengecekan autentikasi
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Untuk halaman yang memerlukan autentikasi, cek token
  if (!token) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Semua path kecuali yang dikecualikan
  ],
};