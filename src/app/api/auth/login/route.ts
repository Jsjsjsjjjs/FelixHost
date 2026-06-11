// src/app/api/auth/login/route.ts

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { ok, error, badRequest, rateLimit, getClientIp, logActivity } from "@/lib/utils/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, 10, 60_000)) {
    return error("Too many login attempts. Please wait.", 429);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid credentials format");

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return error("Invalid email or password", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return error("Invalid email or password", 401);

  const token = await createSession(
    user.id,
    ip,
    req.headers.get("user-agent") ?? undefined
  );

  await setSessionCookie(token);

  await logActivity("LOGIN", user.id, { ipAddress: ip });

  return ok({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
}
