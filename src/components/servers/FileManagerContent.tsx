// src/components/servers/FileManagerContent.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Folder, File, Download,
  Trash2, FolderPlus, RefreshCw, Upload, Edit3,
  ArrowLeft,
} from "lucide-react";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { toast } from "@/store/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { FileObject } from "@/types";

interface FileManagerContentProps {
  identifier: string;
}

async function fetchFiles(identifier: string, dir: string): Promise<FileObject[]> {
  const res = await fetch(`/api/servers/${identifier}/files?dir=${encodeURIComponent(dir)}`);
  if (!res.ok) throw new Error("Failed to list files");
  return (await res.json()).data;
}

export function FileManagerContent({ identifier }: FileManagerContentProps) {
  const [dir, setDir] = useState("/");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const qc = useQueryClient();

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ["files", identifier, dir],
    queryFn: () => fetchFiles(identifier, dir),
  });

  const deleteMutation = useMutation({
    mutationFn: async (filesToDelete: string[]) => {
      const res = await fetch(`/api/servers/${identifier}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", root: dir, files: filesToDelete }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Files deleted");
      setSelected([]);
      setConfirmDelete(false);
      qc.invalidateQueries({ queryKey: ["files", identifier, dir] });
    },
    onError: () => toast.error("Failed to delete files"),
  });

  const mkdirMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/servers/${identifier}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mkdir", root: dir, name }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("Folder created");
      setNewFolderName("");
      setShowNewFolder(false);
      qc.invalidateQueries({ queryKey: ["files", identifier, dir] });
    },
    onError: () => toast.error("Failed to create folder"),
  });

  async function handleDownload(fileName: string) {
    const res = await fetch(
      `/api/servers/${identifier}/files?action=download&file=${encodeURIComponent(`${dir}/${fileName}`.replace("//", "/"))}`
    );
    if (!res.ok) { toast.error("Failed to get download URL"); return; }
    const { data } = await res.json();
    window.open(data.url, "_blank");
  }

  function navigate(name: string) {
    const newDir = `${dir === "/" ? "" : dir}/${name}`;
    setDir(newDir);
    setSelected([]);
  }

  function goUp() {
    if (dir === "/") return;
    const parts = dir.split("/").filter(Boolean);
    parts.pop();
    setDir(parts.length === 0 ? "/" : `/${parts.join("/")}`);
    setSelected([]);
  }

  function toggleSelect(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // Breadcrumb segments
  const pathParts = dir === "/" ? [] : dir.split("/").filter(Boolean);

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-4">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/servers/${identifier}`}
          className="inline-flex items-center gap-1.5 text-sm text-ptero-muted hover:text-ptero-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Server
        </Link>
        <span className="text-ptero-muted">/</span>
        <span className="text-sm text-ptero-text">File Manager</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 rounded-xl border border-ptero-border bg-ptero-surface shrink-0 flex-wrap">
        {/* Path breadcrumbs */}
        <div className="flex items-center gap-1 text-sm min-w-0 flex-1">
          <button
            onClick={() => { setDir("/"); setSelected([]); }}
            className="text-ptero-accent hover:underline font-mono"
          >
            /
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-ptero-muted" />
              <button
                onClick={() => {
                  setDir("/" + pathParts.slice(0, i + 1).join("/"));
                  setSelected([]);
                }}
                className="text-ptero-text hover:text-ptero-accent font-mono truncate max-w-[120px]"
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selected.length})
            </button>
          )}
          <button
            onClick={() => setShowNewFolder((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-ptero-muted hover:text-ptero-text border border-ptero-border hover:border-ptero-accent/40 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md text-ptero-muted hover:text-ptero-text hover:bg-ptero-elevated transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newFolderName.trim()) mkdirMutation.mutate(newFolderName.trim());
              if (e.key === "Escape") setShowNewFolder(false);
            }}
            placeholder="Folder name…"
            autoFocus
            className="flex-1 max-w-xs bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
          />
          <button
            onClick={() => newFolderName.trim() && mkdirMutation.mutate(newFolderName.trim())}
            disabled={mkdirMutation.isPending}
            className="px-4 py-2 rounded-md text-sm bg-ptero-accent text-white hover:bg-ptero-accent/80 transition-all"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewFolder(false)}
            className="px-3 py-2 rounded-md text-sm text-ptero-muted border border-ptero-border hover:text-ptero-text transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* File list */}
      <div className="rounded-xl border border-ptero-border bg-ptero-surface overflow-hidden flex-1">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_160px_120px] gap-4 px-4 py-2.5 border-b border-ptero-border text-xs text-ptero-muted font-medium">
          <span>Name</span>
          <span className="text-right">Size</span>
          <span>Modified</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Go up row */}
        {dir !== "/" && (
          <button
            onClick={goUp}
            className="w-full grid grid-cols-[1fr_80px_160px_120px] gap-4 px-4 py-3 border-b border-ptero-border/50 hover:bg-ptero-elevated/50 transition-colors text-left group"
          >
            <span className="flex items-center gap-2.5 text-sm text-ptero-muted group-hover:text-ptero-text">
              <ArrowLeft className="w-4 h-4" />
              ..
            </span>
            <span />
            <span />
            <span />
          </button>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-ptero-muted text-sm">Loading files…</div>
        ) : files?.length === 0 ? (
          <div className="p-8 text-center text-ptero-muted text-sm">This directory is empty</div>
        ) : (
          <div className="divide-y divide-ptero-border/40">
            {files?.map((file) => {
              const isSelected = selected.includes(file.name);
              return (
                <div
                  key={file.name}
                  className={cn(
                    "grid grid-cols-[1fr_80px_160px_120px] gap-4 px-4 py-3 transition-colors group",
                    isSelected ? "bg-ptero-accent/5 border-l-2 border-ptero-accent" : "hover:bg-ptero-elevated/40 border-l-2 border-transparent"
                  )}
                >
                  <button
                    onClick={() => file.is_file ? toggleSelect(file.name) : navigate(file.name)}
                    className="flex items-center gap-2.5 text-sm text-left min-w-0"
                  >
                    <span className={cn(
                      "shrink-0",
                      file.is_file ? "text-ptero-muted" : "text-ptero-accent"
                    )}>
                      {file.is_file ? <File className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    </span>
                    <span className={cn(
                      "truncate",
                      file.is_file ? "text-ptero-text" : "text-ptero-text font-medium"
                    )}>
                      {file.name}
                    </span>
                  </button>
                  <span className="text-xs text-ptero-muted text-right self-center">
                    {file.is_file ? formatBytes(file.size) : "—"}
                  </span>
                  <span className="text-xs text-ptero-muted self-center">
                    {formatDate(file.modified_at)}
                  </span>
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.is_file && (
                      <button
                        onClick={() => handleDownload(file.name)}
                        className="p-1.5 rounded-md text-ptero-muted hover:text-ptero-accent hover:bg-ptero-accent/10 transition-all"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleSelect(file.name)}
                      className="p-1.5 rounded-md text-ptero-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Select"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelected([file.name]); setConfirmDelete(true); }}
                      className="p-1.5 rounded-md text-ptero-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate(selected)}
        title="Delete Files"
        description={`Permanently delete ${selected.length} item(s)? This cannot be undone.`}
        destructive
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
