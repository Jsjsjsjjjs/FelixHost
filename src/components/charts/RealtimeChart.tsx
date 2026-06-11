// src/components/charts/RealtimeChart.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface DataPoint {
  time: string;
  cpu: number;
  memory: number;
}

interface RealtimeChartProps {
  identifier: string;
}

export function RealtimeChart({ identifier }: RealtimeChartProps) {
  const [history, setHistory] = useState<DataPoint[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    async function tick() {
      try {
        const res = await fetch(`/api/servers/${identifier}`);
        if (!res.ok) return;
        const { data } = await res.json();
        const r = data?.resources;
        if (!r) return;

        const point: DataPoint = {
          time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          cpu: parseFloat(r.cpu.toFixed(2)),
          memory: parseFloat(((r.memory / 1024 / 1024)).toFixed(1)),
        };

        setHistory((prev) => [...prev.slice(-29), point]);
      } catch { /* skip on error */ }
    }

    tick();
    intervalRef.current = setInterval(tick, 5000);
    return () => clearInterval(intervalRef.current);
  }, [identifier]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-lg p-3 text-xs border border-ptero-border shadow-xl">
        <p className="text-ptero-muted mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}{p.name === "CPU" ? "%" : " MB"}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface">
      <h3 className="font-semibold text-ptero-text mb-4 text-sm">Real-time Resource Usage</h3>
      {history.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-ptero-muted text-sm">
          Collecting data…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,55,0.8)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="memory"
              name="Memory"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
