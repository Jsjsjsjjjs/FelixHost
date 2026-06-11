// src/components/servers/ServerDetailContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronLeft, Terminal, FolderOpen, Archive,
  Cpu, MemoryStick, HardDrive, Network,
  Play, Square, RefreshCw, Skull, Clock,
  Server, Globe, Hash,
} from "lucide-react";
import { cn, formatBytes, formatUptime, statusBadgeClass } from "@/lib/utils";
import { ResourceBar } from "@/components/ui/ResourceBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { RealtimeChart } from "@/components/charts/RealtimeChart";
import { toast } from "@/store/ui";
import { useState } from "react";
import type { PowerSignal } from "@/types";

interface ServerDetailContentProps {
  identifier: string;
}

async function fetchServerDetail(id: string) {
  const res = await fetch(`/api/servers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch server");
  return (await res.json()).data;
}

export function ServerDetailContent({ identifier }: ServerDetailContentProps) {
  const [confirmSignal, setConfirmSignal] = useState<PowerSignal | null>(null);
  const [pending, setPending] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["server", identifier],
    queryFn: () => fetchServerDetail(identifier),
    refetchInterval: 10_000,
  });

  const server = data?.server;
  const resources = data?.resources;
  const state = resources?.state ?? "offline";
  const isRunning = state === "running";

  const memPct = server && resources
    ? ((resources.memory) / (server.limits.memory * 1024 * 1024)) * 100
    : 0;
  const diskPct = server && resources
    ? ((resources.disk) / (server.limits.disk * 1024 * 1024)) * 100
    : 0;

  async function sendSignal(signal: PowerSignal) {
    if (!server) return;
    setPending(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal, identifier, serverName: server.name }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Signal sent`, `${signal} → ${server.name}`);
      setTimeout(() => refetch(), 2000);
    } catch {
      toast.error("Failed to send power signal");
    } finally {
      setPending(false);
      setConfirmSignal(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-md" />
          <div className="skeleton h-6 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="text-center py-20">
        <Server className="w-12 h-12 mx-auto mb-3 text-ptero-muted opacity-40" />
        <p className="text-ptero-text font-medium">Server not found</p>
        <Link href="/servers" className="text-ptero-accent text-sm hover:underline mt-2 inline-block">
          ← Back to servers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/servers"
          className="inline-flex items-center gap-1.5 text-sm text-ptero-muted hover:text-ptero-text transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Servers
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-ptero-text tracking-tight">{server.name}</h1>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusBadgeClass(server.suspended ? "suspended" : state))}>
                {server.suspended ? "Suspended" : state.charAt(0).toUpperCase() + state.slice(1)}
              </span>
            </div>
            <p className="text-sm text-ptero-muted font-mono">{identifier}</p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-2">
            <Link
              href={`/servers/${identifier}/console`}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-accent hover:border-ptero-accent/40 transition-all"
            >
              <Terminal className="w-4 h-4" />
              Console
            </Link>
            <Link
              href={`/servers/${identifier}/files`}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-text hover:border-ptero-accent/40 transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              Files
            </Link>
            <Link
              href={`/servers/${identifier}/backups`}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-text hover:border-ptero-accent/40 transition-all"
            >
              <Archive className="w-4 h-4" />
              Backups
            </Link>
          </div>
        </div>
      </div>

      {/* Power controls */}
      {!server.suspended && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-ptero-border bg-ptero-surface">
          <span className="text-sm text-ptero-muted mr-2">Power:</span>
          <button
            onClick={() => isRunning ? setConfirmSignal("stop") : sendSignal("start")}
            disabled={pending}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              isRunning
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            )}
          >
            {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Stop" : "Start"}
          </button>
          <button
            onClick={() => setConfirmSignal("restart")}
            disabled={pending || !isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("w-4 h-4", pending && "animate-spin")} />
            Restart
          </button>
          <button
            onClick={() => setConfirmSignal("kill")}
            disabled={pending || !isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Skull className="w-4 h-4" />
            Kill
          </button>

          {resources?.uptime !== undefined && isRunning && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-ptero-muted">
              <Clock className="w-4 h-4" />
              {formatUptime(resources.uptime)}
            </span>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-ptero-muted hover:text-ptero-text rounded-md hover:bg-ptero-elevated transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          </button>
        </div>
      )}

      {/* Resource cards */}
      {resources && isRunning && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "CPU", value: `${resources.cpu.toFixed(1)}%`, icon: Cpu, pct: resources.cpu, color: "text-indigo-400 bg-indigo-500/10" },
            { label: "Memory", value: formatBytes(resources.memory), icon: MemoryStick, pct: memPct, color: "text-cyan-400 bg-cyan-500/10" },
            { label: "Disk", value: formatBytes(resources.disk), icon: HardDrive, pct: diskPct, color: "text-purple-400 bg-purple-500/10" },
            { label: "Network ↓", value: formatBytes(resources.networkRx), icon: Network, pct: 0, color: "text-emerald-400 bg-emerald-500/10" },
          ].map(({ label, value, icon: Icon, pct, color }) => (
            <div key={label} className="p-4 rounded-xl border border-ptero-border bg-ptero-surface">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-ptero-muted">{label}</span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-ptero-text mb-2">{value}</p>
              {pct > 0 && (
                <div className="h-1 rounded-full bg-ptero-elevated overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-indigo-500"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {isRunning && (
        <RealtimeChart identifier={identifier} />
      )}

      {/* Server info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* General info */}
        <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface">
          <h3 className="font-semibold text-ptero-text mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-ptero-accent" />
            Server Information
          </h3>
          <dl className="space-y-3">
            {[
              { label: "UUID", value: server.uuid, mono: true },
              { label: "Identifier", value: identifier, mono: true },
              { label: "Node ID", value: String(server.node) },
              { label: "Description", value: server.description || "—" },
              { label: "Docker Image", value: server.container?.image ?? "—", mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-sm text-ptero-muted shrink-0">{label}</dt>
                <dd className={cn("text-sm text-ptero-text text-right truncate", mono && "font-mono")}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Limits */}
        <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface">
          <h3 className="font-semibold text-ptero-text mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-ptero-accent" />
            Resource Limits
          </h3>
          <div className="space-y-3">
            <ResourceBar
              label={`CPU — limit: ${server.limits.cpu}%`}
              value={resources?.cpu ?? 0}
              max={server.limits.cpu || 100}
              unit="%"
            />
            <ResourceBar
              label={`Memory — limit: ${server.limits.memory} MB`}
              value={memPct}
              max={100}
              unit="%"
              detail={`${formatBytes(resources?.memory ?? 0)} / ${server.limits.memory}MB`}
            />
            <ResourceBar
              label={`Disk — limit: ${server.limits.disk} MB`}
              value={diskPct}
              max={100}
              unit="%"
              detail={`${formatBytes(resources?.disk ?? 0)} / ${server.limits.disk}MB`}
            />
          </div>
        </div>

        {/* Startup command */}
        <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface lg:col-span-2">
          <h3 className="font-semibold text-ptero-text mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-ptero-accent" />
            Startup Command
          </h3>
          <pre className="console-font text-xs text-emerald-300/80 bg-ptero-elevated rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {server.container?.startup_command ?? "—"}
          </pre>
        </div>

        {/* Environment Variables */}
        {server.container?.environment && Object.keys(server.container.environment).length > 0 && (
          <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface lg:col-span-2">
            <h3 className="font-semibold text-ptero-text mb-3">Environment Variables</h3>
            <div className="space-y-2">
              {Object.entries(server.container.environment).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3 console-font text-xs">
                  <span className="text-ptero-accent shrink-0">{key}</span>
                  <span className="text-ptero-muted">=</span>
                  <span className="text-ptero-text truncate">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmSignal}
        onClose={() => setConfirmSignal(null)}
        onConfirm={() => confirmSignal && sendSignal(confirmSignal)}
        title={`${confirmSignal ? confirmSignal.charAt(0).toUpperCase() + confirmSignal.slice(1) : ""} Server`}
        description={`Are you sure you want to ${confirmSignal} "${server.name}"?`}
        destructive={confirmSignal === "kill" || confirmSignal === "stop"}
        loading={pending}
      />
    </div>
  );
}
