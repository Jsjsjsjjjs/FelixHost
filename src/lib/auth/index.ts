// src/lib/auth/index.ts

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { UserSession } from "@/types";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS ?? "24", 10);
const COOKIE_NAME = "pterocontrol_session";

// ── Token ────────────────────────────────────────────────────

export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_HOURS}h`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

// ── Session ──────────────────────────────────────────────────

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 3600 * 1000);
  const session: UserSession = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
  const token = await signToken(session);

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return token;
}

export async function destroySession(token: string) {
  await db.session.deleteMany({ where: { token } });
}

export async function getSessionUser(token: string): Promise<UserSession | null> {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { token } });
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    role: session.user.role,
  };
}

// ── Cookie helpers ───────────────────────────────────────────

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRY_HOURS * 3600,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionFromCookie(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

// ── Permission helpers ───────────────────────────────────────

export const ROLE_LEVELS: Record<string, number> = {
  VIEWER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return (ROLE_LEVELS[userRole] ?? 0) >= (ROLE_LEVELS[requiredRole] ?? 0);
}

export function requireRole(requiredRole: string) {
  return async (user: UserSession | null) => {
    if (!user) throw new Error("Unauthenticated");
    if (!hasPermission(user.role, requiredRole)) throw new Error("Insufficient permissions");
    return user;
  };
}
