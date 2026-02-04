import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "passao-fast-food-secret-key";

interface JwtPayload {
  userId: string;
  email: string;
  role: "admin" | "staff" | "customer";
}

async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

function getTokenFromCookieOrHeader(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try to get from cookie (for SSR pages)
  const token = request.cookies.get("auth-token")?.value;
  if (token) {
    return token;
  }

  // Try localStorage token from URL (fallback for client-side navigation)
  // This won't work directly, so we rely on client-side redirect
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = getTokenFromCookieOrHeader(request);

  // Allow access to login page without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // If no token, redirect to login page
  if (!token) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check if user has admin or staff role for /admin routes
  if (payload.role !== "admin" && payload.role !== "staff") {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("unauthorized", "true");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
