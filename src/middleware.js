import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session")?.value;

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!session && !isAuthRoute) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
