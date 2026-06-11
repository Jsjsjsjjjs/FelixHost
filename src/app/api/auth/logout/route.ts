// src/app/api/auth/logout/route.ts

import { NextRequest } from "next/server";
import { getTokenFromCookie, destroySession, clearSessionCookie, getSessionFromCookie } from "@/lib/auth";
import { ok, logActivity } from "@/lib/utils/api";

export async function POST(_req: NextRequest) {
  const user = await getSessionFromCookie();
  const token = await getTokenFromCookie();

  if (token) await destroySession(token);
  await clearSessionCookie();

  if (user) await logActivity("LOGOUT", user.id);

  return ok({ message: "Logged out" });
}
