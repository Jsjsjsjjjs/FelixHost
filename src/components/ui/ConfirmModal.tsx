// src/components/ui/ConfirmModal.tsx
"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  destructive,
  loading,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass rounded-xl p-6 w-full max-w-sm animate-fade-in">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            destructive ? "bg-red-500/15" : "bg-yellow-500/15"
          )}>
            <AlertTriangle className={cn("w-5 h-5", destructive ? "text-red-400" : "text-yellow-400")} />
          </div>
          <div>
            <h3 className="font-semibold text-ptero-text">{title}</h3>
            <p className="text-sm text-ptero-muted mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-md text-sm border border-ptero-border text-ptero-muted hover:text-ptero-text transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
              destructive
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-ptero-accent hover:bg-ptero-accent/80 text-white"
            )}
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
