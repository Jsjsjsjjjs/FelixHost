// src/components/ui/ToastContainer.tsx
"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  info: "border-ptero-accent/30 bg-ptero-accent/10 text-ptero-accent",
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border glass animate-slide-in",
              "min-w-[300px] max-w-[400px] shadow-xl",
              colors[toast.type]
            )}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ptero-text">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-ptero-muted mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ptero-muted hover:text-ptero-text transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
