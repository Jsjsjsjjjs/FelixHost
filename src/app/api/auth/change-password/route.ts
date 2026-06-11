// src/app/api/auth/change-password/route.ts

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, error, withAuth, badRequest } from "@/lib/utils/api";

const schema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request");

    const { oldPassword, newPassword } = parsed.data;

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return error("User not found", 404);

    const valid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
    if (!valid) return error("Current password is incorrect", 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });

    return ok({ message: "Password updated" });
  });
}
