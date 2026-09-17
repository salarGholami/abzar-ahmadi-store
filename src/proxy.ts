import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 Proxy: only performs the cheap session-cookie presence check.
 * Full cryptographic verification stays in the Node.js server/layout/API layer
 * because auth.ts uses node:crypto.
 */
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/supplier") ||
    path.startsWith("/customer");
  if (!needsAuth) return NextResponse.next();
  if (req.cookies.get("session")?.value) return NextResponse.next();
  const next = path.startsWith("/supplier")
    ? "/supplier"
    : path.startsWith("/customer")
      ? "/customer"
      : "/dashboard";
  return NextResponse.redirect(new URL(`/account?next=${next}`, req.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/supplier/:path*", "/customer/:path*"],
};
