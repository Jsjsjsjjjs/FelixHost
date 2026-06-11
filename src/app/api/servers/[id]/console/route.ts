// src/app/api/servers/[id]/console/route.ts

import { NextRequest } from "next/server";
import { getConsoleCredentials } from "@/lib/pterodactyl/servers";
import { ok, error, withAuth } from "@/lib/utils/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id } = await params; // id here = identifier (short uuid)
    try {
      const creds = await getConsoleCredentials(id);
      return ok(creds);
    } catch (err) {
      console.error(`[console:${id}] credentials error:`, err);
      return error("Failed to get console credentials");
    }
  });
}
