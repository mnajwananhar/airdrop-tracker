import { NextResponse } from "next/server";

export function middleware(request) {
  // Dapatkan token dari cookies
  const session = request.cookies.get("session")?.value;

  // Cek path saat ini
  const { pathname } = request.nextUrl;

  // Jika user mencoba mengakses halaman yang dilindungi tanpa token
  const isAuthRoute = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");

  // Izinkan akses ke API tanpa pemeriksaan (API routes memiliki pemeriksaan sendiri)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Jika tidak ada session dan bukan halaman auth
  if (!session && !isAuthRoute) {
    // Redirect ke halaman login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Jika ada session dan mencoba mengakses halaman auth
  if (session && isAuthRoute) {
    // Redirect ke halaman utama
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi middleware hanya pada path tertentu
export const config = {
  matcher: [
    // Lindungi semua route kecuali statics
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
