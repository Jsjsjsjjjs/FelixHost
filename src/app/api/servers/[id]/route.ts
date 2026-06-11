// src/app/api/servers/[id]/route.ts

import { NextRequest } from "next/server";
import { getServer, getServerResources } from "@/lib/pterodactyl/servers";
import { ok, error, withAuth } from "@/lib/utils/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id } = await params;
    try {
      const server = await getServer(parseInt(id, 10));
      let resources = null;
      try {
        const r = await getServerResources(server.identifier);
        resources = {
          cpu: r.resources.cpu_absolute,
          memory: r.resources.memory_bytes,
          disk: r.resources.disk_bytes,
          networkRx: r.resources.network_rx_bytes,
          networkTx: r.resources.network_tx_bytes,
          uptime: r.resources.uptime,
          state: r.current_state,
        };
      } catch { /* resources unavailable */ }

      return ok({ server, resources });
    } catch (err) {
      console.error(`[server:${id}] get error:`, err);
      return error("Failed to fetch server details");
    }
  });
}
