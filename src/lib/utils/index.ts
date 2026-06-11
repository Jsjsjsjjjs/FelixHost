// src/lib/utils/index.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export function statusColor(state: string): string {
  switch (state.toLowerCase()) {
    case "running": return "text-emerald-400";
    case "starting": return "text-yellow-400";
    case "stopping": return "text-orange-400";
    case "offline": return "text-slate-500";
    case "suspended": return "text-red-400";
    default: return "text-slate-400";
  }
}

export function statusBadgeClass(state: string): string {
  switch (state.toLowerCase()) {
    case "running": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "starting": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    case "stopping": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "offline": return "bg-slate-700/40 text-slate-400 border-slate-600/30";
    case "suspended": return "bg-red-500/15 text-red-400 border-red-500/30";
    default: return "bg-slate-700/40 text-slate-400 border-slate-600/30";
  }
}

export function cpuColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-indigo-500";
}

export function memColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-500";
  return "bg-cyan-500";
}

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
