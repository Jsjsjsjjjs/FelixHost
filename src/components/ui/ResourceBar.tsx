// src/components/ui/ResourceBar.tsx

import { cn, cpuColor } from "@/lib/utils";

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  detail?: string;
  colorOverride?: string;
}

export function ResourceBar({ label, value, max, unit = "", detail, colorOverride }: ResourceBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = colorOverride ?? cpuColor(pct);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-ptero-muted">{label}</span>
        <span className="text-xs text-ptero-text font-mono">
          {detail ?? `${value.toFixed(1)}${unit}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-ptero-elevated overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
