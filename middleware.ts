import { NextRequest, NextResponse } from "next/server";

declare function atob(data: string): string;

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  // If admin credentials are not configured, skip auth.
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.warn(
      "ADMIN_USER or ADMIN_PASS is not set. /admin routes are not protected.",
    );
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");

  if (!header || !header.startsWith("Basic ")) {
    return unauthorized();
  }

  const base64Credentials = header.slice("Basic ".length).trim();

  let decoded: string;
  try {
    decoded = atob(base64Credentials);
  } catch {
    return unauthorized();
  }

  const [user, pass] = decoded.split(":");

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

