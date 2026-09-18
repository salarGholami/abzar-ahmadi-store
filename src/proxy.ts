import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 Proxy: only performs the cheap session-cookie presence check.
 * Full cryptographic verification stays in the Node.js server/layout/API layer
 * because auth.ts uses node:crypto.
 */
export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.next();
  if (req.cookies.get("session")?.value) return NextResponse.next();
  return NextResponse.redirect(new URL("/account?next=/dashboard", req.url));
}

export const config = { matcher: ["/dashboard/:path*"] };
