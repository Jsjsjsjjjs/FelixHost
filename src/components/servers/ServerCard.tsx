// src/components/servers/ServerCard.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Play, Square, RefreshCw, Skull, Terminal, ChevronRight } from "lucide-react";
import { cn, formatBytes, formatUptime, statusBadgeClass } from "@/lib/utils";
import { toast } from "@/store/ui";
import type { EnrichedServer } from "@/types";
import type { PowerSignal } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ResourceBar } from "@/components/ui/ResourceBar";

interface ServerCardProps {
  server: EnrichedServer;
}

export function ServerCard({ server }: ServerCardProps) {
  const { resources } = server;
  const state = resources?.state ?? "offline";
  const [pending, setPending] = useState<PowerSignal | null>(null);
  const [confirmSignal, setConfirmSignal] = useState<PowerSignal | null>(null);

  const isRunning = state === "running";
  const memPct = server.limits.memory > 0
    ? ((resources?.memory ?? 0) / (server.limits.memory * 1024 * 1024)) * 100
    : 0;
  const diskPct = server.limits.disk > 0
    ? ((resources?.disk ?? 0) / (server.limits.disk * 1024 * 1024)) * 100
    : 0;

  async function sendSignal(signal: PowerSignal) {
    setPending(signal);
    try {
      const res = await fetch(`/api/servers/${server.id}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal, identifier: server.identifier, serverName: server.name }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${signal.charAt(0).toUpperCase() + signal.slice(1)} signal sent`, server.name);
    } catch {
      toast.error("Power action failed", "Please try again");
    }
    setPending(null);
    setConfirmSignal(null);
  }

  return (
    <>
      <div className={cn(
        "rounded-xl border bg-ptero-surface p-4 transition-all hover:border-ptero-accent/30 group",
        server.suspended ? "border-red-500/30" : "border-ptero-border",
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              {/* Status dot with pulse */}
              <span className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                state === "running" ? "bg-emerald-400 status-ring-running" :
                state === "starting" ? "bg-yellow-400 status-ring-starting" :
                state === "stopping" ? "bg-orange-400" :
                "bg-slate-600"
              )} />
              <h3 className="font-semibold text-ptero-text text-sm truncate">{server.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusBadgeClass(server.suspended ? "suspended" : state))}>
                {server.suspended ? "Suspended" : state.charAt(0).toUpperCase() + state.slice(1)}
              </span>
              <span className="text-xs text-ptero-muted font-mono">{server.identifier}</span>
            </div>
          </div>
        </div>

        {/* Resource bars */}
        {isRunning && resources && (
          <div className="space-y-2 mb-4">
            <ResourceBar label="CPU" value={resources.cpu} max={server.limits.cpu > 0 ? server.limits.cpu : 100} unit="%" />
            <ResourceBar label="RAM" value={memPct} max={100} unit="%" detail={`${formatBytes(resources.memory)} / ${server.limits.memory}MB`} />
            <ResourceBar label="Disk" value={diskPct} max={100} unit="%" detail={`${formatBytes(resources.disk)} / ${server.limits.disk}MB`} />
          </div>
        )}

        {isRunning && resources?.uptime !== undefined && (
          <p className="text-xs text-ptero-muted mb-4">
            Uptime: <span className="text-ptero-text">{formatUptime(resources.uptime)}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 border-t border-ptero-border/50">
          {!server.suspended && (
            <>
              <button
                onClick={() => isRunning ? setConfirmSignal("stop") : sendSignal("start")}
                disabled={!!pending}
                title={isRunning ? "Stop" : "Start"}
                className={cn(
                  "p-2 rounded-md transition-all text-sm",
                  isRunning
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-emerald-400 hover:bg-emerald-500/10",
                  pending === (isRunning ? "stop" : "start") && "opacity-50 cursor-not-allowed"
                )}
              >
                {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setConfirmSignal("restart")}
                disabled={!!pending || !isRunning}
                title="Restart"
                className="p-2 rounded-md text-yellow-400 hover:bg-yellow-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn("w-4 h-4", pending === "restart" && "animate-spin")} />
              </button>
              <button
                onClick={() => setConfirmSignal("kill")}
                disabled={!!pending || !isRunning}
                title="Kill"
                className="p-2 rounded-md text-orange-400 hover:bg-orange-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Skull className="w-4 h-4" />
              </button>
            </>
          )}

          <Link
            href={`/servers/${server.identifier}/console`}
            className="p-2 rounded-md text-ptero-muted hover:text-ptero-accent hover:bg-ptero-accent/10 transition-all ml-auto"
            title="Open Console"
          >
            <Terminal className="w-4 h-4" />
          </Link>
          <Link
            href={`/servers/${server.identifier}`}
            className="p-2 rounded-md text-ptero-muted hover:text-ptero-text hover:bg-ptero-elevated transition-all"
            title="View Details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmSignal}
        onClose={() => setConfirmSignal(null)}
        onConfirm={() => confirmSignal && sendSignal(confirmSignal)}
        title={`${confirmSignal?.charAt(0).toUpperCase() ?? ""}${confirmSignal?.slice(1) ?? ""} Server`}
        description={`Are you sure you want to ${confirmSignal} "${server.name}"? This action cannot be undone.`}
        destructive={confirmSignal === "kill" || confirmSignal === "stop"}
        loading={!!pending}
      />
    </>
  );
}
