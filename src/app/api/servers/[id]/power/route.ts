// src/app/api/servers/[id]/power/route.ts

import { NextRequest } from "next/server";
import { z } from "zod";
import { sendPowerSignal } from "@/lib/pterodactyl/servers";
import { ok, error, withRole, badRequest, logActivity, getClientIp } from "@/lib/utils/api";
import type { PowerSignal } from "@/types";

const schema = z.object({
  signal: z.enum(["start", "stop", "restart", "kill"]),
  identifier: z.string().min(1),
  serverName: z.string().optional(),
});

const actionMap: Record<PowerSignal, "SERVER_START" | "SERVER_STOP" | "SERVER_RESTART" | "SERVER_KILL"> = {
  start: "SERVER_START",
  stop: "SERVER_STOP",
  restart: "SERVER_RESTART",
  kill: "SERVER_KILL",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, "MODERATOR", async (user) => {
    const { id } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request body");

    const { signal, identifier, serverName } = parsed.data;

    try {
      await sendPowerSignal(identifier, signal);

      await logActivity(actionMap[signal], user.id, {
        serverId: id,
        serverName: serverName ?? id,
        ipAddress: getClientIp(req),
      });

      return ok({ signal, identifier });
    } catch (err) {
      console.error(`[power:${identifier}] ${signal} error:`, err);
      return error(`Failed to send ${signal} signal`);
    }
  });
}
