// src/components/dashboard/PowerAllModal.tsx
"use client";

import { useState } from "react";
import { Play, Square, RefreshCw, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/store/ui";
import type { EnrichedServer } from "@/types";

interface PowerAllModalProps {
  servers: EnrichedServer[];
}

type Signal = "start" | "stop" | "restart";

const actions: { signal: Signal; label: string; icon: typeof Play; colorClass: string }[] = [
  { signal: "start", label: "Start All", icon: Play, colorClass: "text-emerald-400 hover:bg-emerald-500/10" },
  { signal: "stop", label: "Stop All", icon: Square, colorClass: "text-red-400 hover:bg-red-500/10" },
  { signal: "restart", label: "Restart All", icon: RefreshCw, colorClass: "text-yellow-400 hover:bg-yellow-500/10" },
];

export function PowerAllModal({ servers }: PowerAllModalProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!confirm) return;
    setLoading(true);

    let success = 0;
    let failed = 0;

    await Promise.allSettled(
      servers.map(async (s) => {
        const res = await fetch(`/api/servers/${s.id}/power`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signal: confirm,
            identifier: s.identifier,
            serverName: s.name,
          }),
        });
        if (res.ok) success++;
        else failed++;
      })
    );

    toast.success(
      `${confirm.charAt(0).toUpperCase() + confirm.slice(1)} signal sent`,
      `${success} succeeded${failed > 0 ? `, ${failed} failed` : ""}`
    );

    setLoading(false);
    setConfirm(null);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-ptero-accent/10 border border-ptero-accent/30 text-ptero-accent hover:bg-ptero-accent/20 transition-all"
      >
        <Zap className="w-4 h-4" />
        Power Actions
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 glass rounded-xl p-6 w-full max-w-sm animate-fade-in">
            {confirm ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ptero-text">Confirm Action</h3>
                    <p className="text-sm text-ptero-muted">
                      {confirm.charAt(0).toUpperCase() + confirm.slice(1)} all {servers.length} servers?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(null)}
                    className="flex-1 px-4 py-2 rounded-md text-sm border border-ptero-border text-ptero-muted hover:text-ptero-text transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-md text-sm bg-ptero-accent hover:bg-ptero-accent/80 text-white font-medium transition-all"
                  >
                    {loading ? "Sending…" : "Confirm"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-ptero-text mb-1">Power Actions</h3>
                <p className="text-sm text-ptero-muted mb-4">Apply a power signal to all {servers.length} servers</p>
                <div className="space-y-2">
                  {actions.map(({ signal, label, icon: Icon, colorClass }) => (
                    <button
                      key={signal}
                      onClick={() => setConfirm(signal)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium border border-ptero-border hover:border-transparent transition-all",
                        colorClass
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
