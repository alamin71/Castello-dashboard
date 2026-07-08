import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth pages through unconditionally
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to login
  const auth = request.cookies.get("castello_auth")?.value;
  if (!auth) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
