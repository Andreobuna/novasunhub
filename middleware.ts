import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

// Lightweight edge-safe check: verifies the JWT signature/expiry only.
// Route handlers still re-check the DB user (status, role) via requireAdmin/requireUser.
export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (req.nextUrl.pathname.startsWith("/account")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
