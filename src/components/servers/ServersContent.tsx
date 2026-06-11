// src/components/servers/ServersContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Server, Search, RefreshCw, Filter } from "lucide-react";
import { ServerCard } from "./ServerCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { cn } from "@/lib/utils";
import type { EnrichedServer } from "@/types";

type FilterState = "all" | "running" | "offline" | "suspended";

async function fetchServers(): Promise<EnrichedServer[]> {
  const res = await fetch("/api/servers");
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data;
}

export function ServersContent() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterState>("all");

  const { data: servers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
    refetchInterval: 30_000,
  });

  const filtered = (servers ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.identifier.toLowerCase().includes(search.toLowerCase());

    const state = s.resources?.state ?? "offline";
    const matchFilter =
      filter === "all" ||
      (filter === "suspended" && s.suspended) ||
      (!s.suspended && filter === state);

    return matchSearch && matchFilter;
  });

  const filters: { label: string; value: FilterState; color: string }[] = [
    { label: "All", value: "all", color: "text-ptero-text" },
    { label: "Running", value: "running", color: "text-emerald-400" },
    { label: "Offline", value: "offline", color: "text-slate-400" },
    { label: "Suspended", value: "suspended", color: "text-red-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Servers</h1>
          <p className="text-sm text-ptero-muted mt-0.5">
            {servers ? `${servers.length} servers total` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-elevated border border-ptero-border text-ptero-muted hover:text-ptero-text hover:border-ptero-accent/50 transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ptero-muted" />
          <input
            type="text"
            placeholder="Search servers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ptero-elevated border border-ptero-border rounded-md pl-9 pr-4 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50 focus:border-ptero-accent/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-ptero-elevated border border-ptero-border rounded-md p-1">
          <Filter className="w-3.5 h-3.5 text-ptero-muted ml-1" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                filter === f.value
                  ? "bg-ptero-surface text-ptero-text shadow-sm"
                  : "text-ptero-muted hover:text-ptero-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-ptero-muted">
          <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-ptero-text">
            {search || filter !== "all" ? "No servers match your filters" : "No servers found"}
          </p>
          <p className="text-sm mt-1">
            {search || filter !== "all"
              ? "Try adjusting your search or filter"
              : "Check your Pterodactyl API key permissions"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}
