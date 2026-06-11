// src/components/dashboard/StatCard.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "indigo" | "emerald" | "slate" | "red" | "yellow" | "cyan" | "purple";

const accentClasses: Record<Accent, string> = {
  indigo: "text-indigo-400 bg-indigo-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  slate: "text-slate-400 bg-slate-500/10",
  red: "text-red-400 bg-red-500/10",
  yellow: "text-yellow-400 bg-yellow-500/10",
  cyan: "text-cyan-400 bg-cyan-500/10",
  purple: "text-purple-400 bg-purple-500/10",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  accent?: Accent;
  wide?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent = "indigo",
  wide,
}: StatCardProps) {
  const accentClass = accentClasses[accent];

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-ptero-border bg-ptero-surface p-5", wide && "")}>
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ptero-border bg-ptero-surface p-5 hover:border-ptero-accent/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-ptero-muted font-medium">{label}</p>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", accentClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-ptero-text tracking-tight">{value}</p>
    </div>
  );
}
