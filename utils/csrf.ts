import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Skip validation for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const cookieToken = request.cookies.get("csrf-token")?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}

/**
 * Add CSRF token to response
 */
export function setCsrfToken(response: NextResponse): NextResponse {
  const token = generateCsrfToken();

  response.cookies.set("csrf-token", token, {
    httpOnly: false, // Must be readable by JS to send in headers
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Use lax for better compatibility with redirects
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
