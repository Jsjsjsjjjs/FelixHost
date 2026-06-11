// src/app/api/users/route.ts

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, error, withRole, badRequest } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  return withRole(req, "ADMIN", async () => {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return ok(users);
    } catch {
      return error("Failed to fetch users");
    }
  });
}

const createSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
  role: z.enum(["OWNER", "ADMIN", "MODERATOR", "VIEWER"]).default("VIEWER"),
});

export async function POST(req: NextRequest) {
  return withRole(req, "OWNER", async () => {
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { email, username, password, role } = parsed.data;

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) return badRequest("Email or username already taken");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email, username, passwordHash, role },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    return ok(user, 201);
  });
}
