// src/components/dashboard/ActivityContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw, Server, LogIn, LogOut, File, Archive } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ActivityEntry {
  id: string;
  action: string;
  serverId: string | null;
  serverName: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; username: string; email: string } | null;
}

const actionIcons: Record<string, typeof Activity> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  SERVER_START: Server,
  SERVER_STOP: Server,
  SERVER_RESTART: Server,
  SERVER_KILL: Server,
  FILE_VIEW: File,
  FILE_UPLOAD: File,
  FILE_DOWNLOAD: File,
  FILE_DELETE: File,
  BACKUP_CREATE: Archive,
  BACKUP_DELETE: Archive,
};

const actionColors: Record<string, string> = {
  LOGIN: "text-emerald-400 bg-emerald-500/10",
  LOGOUT: "text-slate-400 bg-slate-500/10",
  SERVER_START: "text-emerald-400 bg-emerald-500/10",
  SERVER_STOP: "text-red-400 bg-red-500/10",
  SERVER_RESTART: "text-yellow-400 bg-yellow-500/10",
  SERVER_KILL: "text-orange-400 bg-orange-500/10",
  FILE_DELETE: "text-red-400 bg-red-500/10",
  BACKUP_DELETE: "text-red-400 bg-red-500/10",
  BACKUP_CREATE: "text-blue-400 bg-blue-500/10",
};

function actionLabel(action: string): string {
  return action.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

export function ActivityContent() {
  const { data, isLoading, refetch, isFetching } = useQuery<{
    items: ActivityEntry[];
    total: number;
  }>({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await fetch("/api/activity?perPage=100");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Activity Log</h1>
          <p className="text-sm text-ptero-muted mt-0.5">
            {data ? `${data.total} total events` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-text transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-ptero-border bg-ptero-surface overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_100px] gap-4 px-5 py-3 border-b border-ptero-border text-xs text-ptero-muted font-medium">
          <span />
          <span>Action</span>
          <span>User</span>
          <span>Server</span>
          <span className="text-right">Time</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-ptero-muted text-sm">Loading events…</div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center text-ptero-muted">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-ptero-border/40">
            {data.items.map((entry) => {
              const Icon = actionIcons[entry.action] ?? Activity;
              const color = actionColors[entry.action] ?? "text-ptero-muted bg-ptero-elevated";
              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[40px_1fr_1fr_1fr_100px] gap-4 px-5 py-3.5 hover:bg-ptero-elevated/30 transition-colors items-center"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-ptero-text font-medium">
                    {actionLabel(entry.action)}
                  </span>
                  <span className="text-sm text-ptero-muted truncate">
                    {entry.user?.username ?? "System"}
                  </span>
                  <span className="text-sm text-ptero-muted truncate">
                    {entry.serverName ?? "—"}
                  </span>
                  <span className="text-xs text-ptero-muted text-right">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
