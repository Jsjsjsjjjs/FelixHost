// src/app/api/auth/me/route.ts

import { NextRequest } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/utils/api";

export async function GET(_req: NextRequest) {
  const user = await getSessionFromCookie();
  if (!user) return unauthorized();
  return ok({ user });
}
