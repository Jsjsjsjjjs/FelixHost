// src/components/servers/BackupsContent.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronLeft, Archive, Plus, Download, Trash2,
  CheckCircle, Clock, RefreshCw, AlertTriangle,
} from "lucide-react";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { toast } from "@/store/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { BackupAttributes } from "@/types";

interface BackupsContentProps {
  identifier: string;
}

export function BackupsContent({ identifier }: BackupsContentProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newBackupName, setNewBackupName] = useState("");
  const qc = useQueryClient();

  const { data: backups, isLoading, refetch } = useQuery<BackupAttributes[]>({
    queryKey: ["backups", identifier],
    queryFn: async () => {
      const res = await fetch(`/api/servers/${identifier}/backups`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name?: string) => {
      const res = await fetch(`/api/servers/${identifier}/backups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create backup");
      return (await res.json()).data;
    },
    onSuccess: () => {
      toast.success("Backup started", "This may take a few minutes");
      setNewBackupName("");
      qc.invalidateQueries({ queryKey: ["backups", identifier] });
    },
    onError: () => toast.error("Failed to create backup"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await fetch(`/api/servers/${identifier}/backups`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("Backup deleted");
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["backups", identifier] });
    },
    onError: () => toast.error("Failed to delete backup"),
  });

  async function handleDownload(uuid: string) {
    const res = await fetch(`/api/servers/${identifier}/backups?action=download&uuid=${uuid}`);
    if (!res.ok) { toast.error("Failed to get download URL"); return; }
    const { data } = await res.json();
    window.open(data.url, "_blank");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href={`/servers/${identifier}`}
          className="inline-flex items-center gap-1.5 text-sm text-ptero-muted hover:text-ptero-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Server
        </Link>
        <span className="text-ptero-muted">/</span>
        <span className="text-sm text-ptero-text">Backups</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Backups</h1>
          <p className="text-sm text-ptero-muted mt-0.5">
            {backups ? `${backups.length} backup${backups.length !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-md text-ptero-muted hover:text-ptero-text hover:bg-ptero-elevated transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Create backup */}
      <div className="p-4 rounded-xl border border-ptero-border bg-ptero-surface">
        <h3 className="text-sm font-semibold text-ptero-text mb-3">Create New Backup</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newBackupName}
            onChange={(e) => setNewBackupName(e.target.value)}
            placeholder="Backup name (optional)…"
            className="flex-1 max-w-xs bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
          />
          <button
            onClick={() => createMutation.mutate(newBackupName.trim() || undefined)}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-ptero-accent text-white hover:bg-ptero-accent/80 transition-all disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Creating…" : "Create Backup"}
          </button>
        </div>
      </div>

      {/* Backups list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))
        ) : backups?.length === 0 ? (
          <div className="text-center py-16 text-ptero-muted">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-ptero-text">No backups yet</p>
            <p className="text-sm">Create your first backup above</p>
          </div>
        ) : (
          backups?.map((backup) => (
            <div
              key={backup.uuid}
              className="flex items-center gap-4 p-4 rounded-xl border border-ptero-border bg-ptero-surface hover:border-ptero-accent/20 transition-all"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                backup.is_successful
                  ? "bg-emerald-500/10 text-emerald-400"
                  : backup.completed_at
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              )}>
                {backup.is_successful ? (
                  <CheckCircle className="w-5 h-5" />
                ) : backup.completed_at ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ptero-text truncate">
                  {backup.name || "Unnamed Backup"}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-ptero-muted">
                    {formatDate(backup.created_at)}
                  </span>
                  {backup.bytes > 0 && (
                    <span className="text-xs text-ptero-muted">
                      {formatBytes(backup.bytes)}
                    </span>
                  )}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    backup.is_successful
                      ? "bg-emerald-500/10 text-emerald-400"
                      : backup.completed_at
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  )}>
                    {backup.is_successful ? "Complete" : backup.completed_at ? "Failed" : "In Progress"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {backup.is_successful && (
                  <button
                    onClick={() => handleDownload(backup.uuid)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-ptero-accent hover:bg-ptero-accent/10 border border-ptero-accent/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(backup.uuid)}
                  className="p-1.5 rounded-md text-ptero-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete backup"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
        title="Delete Backup"
        description="Permanently delete this backup? This action cannot be undone."
        destructive
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
