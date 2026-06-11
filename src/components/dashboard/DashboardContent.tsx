// src/components/dashboard/DashboardContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Play,
  Square,
  Pause,
  RefreshCw,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { ServerCard } from "@/components/servers/ServerCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { PowerAllModal } from "./PowerAllModal";
import type { EnrichedServer } from "@/types";
import { formatBytes } from "@/lib/utils";

async function fetchServers(): Promise<EnrichedServer[]> {
  const res = await fetch("/api/servers");
  if (!res.ok) throw new Error("Failed to fetch servers");
  const json = await res.json();
  return json.data;
}

export function DashboardContent() {
  const { data: servers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
    refetchInterval: 30_000,
  });

  const stats = servers
    ? {
        total: servers.length,
        running: servers.filter((s) => s.resources?.state === "running").length,
        stopped: servers.filter((s) => s.resources?.state === "offline").length,
        suspended: servers.filter((s) => s.suspended).length,
        totalCpu: servers.reduce((a, s) => a + (s.resources?.cpu ?? 0), 0),
        totalMemory: servers.reduce((a, s) => a + (s.resources?.memory ?? 0), 0),
        totalDisk: servers.reduce((a, s) => a + (s.resources?.disk ?? 0), 0),
      }
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Dashboard</h1>
          <p className="text-sm text-ptero-muted mt-0.5">
            Overview of your Pterodactyl infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PowerAllModal servers={servers ?? []} />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-text hover:border-ptero-accent/50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Servers"
          value={stats?.total ?? "—"}
          icon={Server}
          loading={isLoading}
          accent="indigo"
        />
        <StatCard
          label="Running"
          value={stats?.running ?? "—"}
          icon={Play}
          loading={isLoading}
          accent="emerald"
        />
        <StatCard
          label="Stopped"
          value={stats?.stopped ?? "—"}
          icon={Square}
          loading={isLoading}
          accent="slate"
        />
        <StatCard
          label="Suspended"
          value={stats?.suspended ?? "—"}
          icon={Pause}
          loading={isLoading}
          accent="red"
        />
      </div>

      {/* Resource stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total CPU Usage"
          value={stats ? `${stats.totalCpu.toFixed(1)}%` : "—"}
          icon={Cpu}
          loading={isLoading}
          accent="yellow"
          wide
        />
        <StatCard
          label="Total Memory In Use"
          value={stats ? formatBytes(stats.totalMemory) : "—"}
          icon={MemoryStick}
          loading={isLoading}
          accent="cyan"
          wide
        />
        <StatCard
          label="Total Disk In Use"
          value={stats ? formatBytes(stats.totalDisk) : "—"}
          icon={HardDrive}
          loading={isLoading}
          accent="purple"
          wide
        />
      </div>

      {/* Server list */}
      <div>
        <h2 className="text-lg font-semibold text-ptero-text mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-ptero-accent" />
          All Servers
        </h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : servers?.length === 0 ? (
          <div className="text-center py-16 text-ptero-muted">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No servers found</p>
            <p className="text-sm">Make sure your Pterodactyl API key has the correct permissions</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servers?.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
