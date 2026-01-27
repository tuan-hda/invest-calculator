import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*"],
};

export async function middleware(req: NextRequest) {
  // 1. Check for Basic Auth header
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  // Bypass logic for public assets if needed (e.g., images, api/public)
  if (url.pathname.startsWith("/_next") || url.pathname.startsWith("/static")) {
    return NextResponse.next();
  }

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    const validUser = process.env.AUTH_USER;
    const validPass = process.env.AUTH_PASS;

    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  // 2. Artificial Delay for Brute Force Protection
  // Wait 2 seconds before returning 401
  await new Promise((resolve) => setTimeout(resolve, 2000));

  url.pathname = "/api/auth";

  return new NextResponse("Auth Required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
