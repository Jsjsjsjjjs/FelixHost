// src/lib/utils/api.ts

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionFromCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserSession, ApiResponse } from "@/types";
import type { ActionType } from "@prisma/client";

// ── Response helpers ─────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 500): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized() {
  return error("Unauthorized", 401);
}

export function forbidden() {
  return error("Forbidden", 403);
}

export function notFound(msg = "Not found") {
  return error(msg, 404);
}

export function badRequest(msg: string) {
  return error(msg, 400);
}

// ── Auth middleware ──────────────────────────────────────────

export async function withAuth(
  _req: NextRequest,
  handler: (user: UserSession) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getSessionFromCookie();
  if (!user) return unauthorized();
  return handler(user);
}

export async function withRole(
  _req: NextRequest,
  role: string,
  handler: (user: UserSession) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getSessionFromCookie();
  if (!user) return unauthorized();

  const levels: Record<string, number> = { VIEWER: 1, MODERATOR: 2, ADMIN: 3, OWNER: 4 };
  if ((levels[user.role] ?? 0) < (levels[role] ?? 0)) return forbidden();

  return handler(user);
}

// ── In-memory rate limiter (per IP) ─────────────────────────

const rateLimitMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Activity logging ─────────────────────────────────────────

export async function logActivity(
  action: ActionType,
  userId?: string,
  details?: {
    serverId?: string;
    serverName?: string;
    extra?: Record<string, unknown>;
    ipAddress?: string;
  }
) {
  const detailsJson =
    details?.extra != null
      ? (JSON.parse(JSON.stringify(details.extra)) as Prisma.InputJsonValue)
      : Prisma.JsonNull;

  await db.activityLog.create({
    data: {
      action,
      userId: userId ?? null,
      serverId: details?.serverId ?? null,
      serverName: details?.serverName ?? null,
      details: detailsJson,
      ipAddress: details?.ipAddress ?? null,
    },
  });
}
