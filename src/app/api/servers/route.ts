// src/app/api/servers/route.ts

import { NextRequest } from "next/server";
import { listServers } from "@/lib/pterodactyl/servers";
import { getServerResources } from "@/lib/pterodactyl/servers";
import { ok, error, withAuth } from "@/lib/utils/api";
import type { EnrichedServer } from "@/types";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const servers = await listServers();

      // Enrich with live resource data (parallel)
      const enriched: EnrichedServer[] = await Promise.all(
        servers.map(async (s) => {
          let resources: EnrichedServer["resources"];
          try {
            const r = await getServerResources(s.identifier);
            resources = {
              cpu: r.resources.cpu_absolute,
              memory: r.resources.memory_bytes,
              disk: r.resources.disk_bytes,
              networkRx: r.resources.network_rx_bytes,
              networkTx: r.resources.network_tx_bytes,
              uptime: r.resources.uptime,
              state: r.current_state,
            };
          } catch {
            resources = undefined;
          }

          return {
            id: s.id,
            uuid: s.uuid,
            identifier: s.identifier,
            name: s.name,
            description: s.description,
            node: String(s.node),
            status: s.status ?? "unknown",
            suspended: s.suspended,
            limits: {
              memory: s.limits.memory,
              cpu: s.limits.cpu,
              disk: s.limits.disk,
            },
            resources,
          };
        })
      );

      return ok(enriched);
    } catch (err) {
      console.error("[servers] list error:", err);
      return error("Failed to fetch servers");
    }
  });
}
