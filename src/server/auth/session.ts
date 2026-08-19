import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRole, User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { UnauthenticatedError, ForbiddenError } from "../../domain/errors";
import { UserDTO, toUserDTO } from "../../domain/types/auth";

export const SESSION_COOKIE_NAME = "ven_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

export function getSessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Extracts session token from request cookies or Authorization header
 */
export function extractSessionToken(req?: NextRequest): string | null {
  if (req) {
    const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (cookieToken) return cookieToken;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }
  }
  return null;
}

/**
 * Attaches the session cookie to an outgoing NextResponse
 */
export function setSessionCookie(res: NextResponse, sessionToken: string): void {
  const options = getSessionCookieOptions();
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, options);
}

/**
 * Clears the session cookie on an outgoing NextResponse
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Resolves current user from database session token.
 * Strictly server-authoritative.
 */
export async function getSessionUser(sessionToken: string | null): Promise<User | null> {
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) return null;

  // Verify expiration
  if (session.expiresAt < new Date()) {
    // Delete expired session asynchronously
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Verify user is active and not archived
  if (!session.user.isActive || session.user.archivedAt !== null) {
    return null;
  }

  return session.user;
}

/**
 * Retrieves the currently authenticated UserDTO or null
 */
export async function getCurrentUser(req?: NextRequest): Promise<UserDTO | null> {
  let token = extractSessionToken(req);

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
    } catch {
      // Ignore outside Server Component / Route Handler context
    }
  }

  const user = await getSessionUser(token);
  return user ? toUserDTO(user) : null;
}

/**
 * Enforces authenticated session; throws UnauthenticatedError if missing or invalid
 */
export async function requireAuth(req?: NextRequest): Promise<User> {
  let token = extractSessionToken(req);

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
    } catch {
      // Ignore
    }
  }

  const user = await getSessionUser(token);
  if (!user) {
    throw new UnauthenticatedError("Authentication required. Please sign in.");
  }

  return user;
}

/**
 * Enforces specific role access; throws ForbiddenError if role mismatch.
 * Server-authoritative: role resolved directly from DB User record.
 */
export async function requireRole(role: UserRole, req?: NextRequest): Promise<User> {
  const user = await requireAuth(req);

  if (user.role !== role) {
    throw new ForbiddenError("Forbidden: Insufficient privileges to access this resource");
  }

  return user;
}

/**
 * Enforces ADMIN role specifically
 */
export async function requireAdmin(req?: NextRequest): Promise<User> {
  return requireRole(UserRole.ADMIN, req);
}
