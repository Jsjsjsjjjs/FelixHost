// src/components/console/ConsoleView.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal, Send, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/store/ui";

interface ConsoleLine {
  id: number;
  text: string;
  type: "output" | "error" | "system";
  timestamp: Date;
}

interface ConsoleViewProps {
  identifier: string;
}

export function ConsoleView({ identifier }: ConsoleViewProps) {
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  const addLine = useCallback((text: string, type: ConsoleLine["type"] = "output") => {
    setLines((prev) => [
      ...prev.slice(-1000), // keep last 1000 lines
      { id: ++counterRef.current, text, type, timestamp: new Date() },
    ]);
  }, []);

  useEffect(() => {
    let ws: WebSocket;
    let pingInterval: ReturnType<typeof setInterval>;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    async function connect() {
      try {
        const res = await fetch(`/api/servers/${identifier}/console`);
        if (!res.ok) throw new Error("Failed to get credentials");
        const { data } = await res.json();
        const { token, socket } = data;

        addLine("Connecting to server console…", "system");

        ws = new WebSocket(socket);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ event: "auth", args: [token] }));
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            switch (msg.event) {
              case "auth success":
                setConnected(true);
                ws.send(JSON.stringify({ event: "send logs", args: [null] }));
                addLine("Console connected.", "system");
                break;
              case "console output":
              case "output":
                (msg.args as string[]).forEach((line) => addLine(line));
                break;
              case "status":
                addLine(`Server status: ${msg.args?.[0]}`, "system");
                break;
              case "token expiring":
                // Re-auth
                fetch(`/api/servers/${identifier}/console`)
                  .then((r) => r.json())
                  .then(({ data }) => {
                    ws.send(JSON.stringify({ event: "auth", args: [data.token] }));
                  });
                break;
              case "daemon error":
              case "jwt error":
                addLine(`Error: ${msg.args?.[0]}`, "error");
                break;
            }
          } catch { /* non-JSON message */ }
        };

        ws.onclose = () => {
          setConnected(false);
          addLine("Console disconnected. Reconnecting in 5s…", "system");
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          addLine("WebSocket error occurred.", "error");
        };

        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "ping", args: [] }));
          }
        }, 20_000);
      } catch (err) {
        addLine(`Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [identifier, addLine]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function sendCommand() {
    if (!command.trim() || !wsRef.current || !connected) return;
    wsRef.current.send(JSON.stringify({ event: "send command", args: [command] }));
    addLine(`> ${command}`, "system");
    setCommand("");
  }

  const filteredLines = search
    ? lines.filter((l) => l.text.toLowerCase().includes(search.toLowerCase()))
    : lines;

  return (
    <div className="flex flex-col h-full rounded-xl border border-ptero-border bg-ptero-surface overflow-hidden">
      {/* Console header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ptero-border shrink-0">
        <Terminal className="w-4 h-4 text-ptero-accent" />
        <span className="text-sm font-medium text-ptero-text">Console</span>
        <span className={cn(
          "ml-auto flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border",
          connected
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            : "text-slate-400 bg-slate-500/10 border-slate-500/30"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-emerald-400" : "bg-slate-500")} />
          {connected ? "Live" : "Disconnected"}
        </span>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ptero-muted" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1 text-xs rounded-md bg-ptero-elevated border border-ptero-border text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
          />
        </div>

        <button
          onClick={() => setLines([])}
          className="p-1.5 text-ptero-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
          title="Clear console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 console-font text-xs leading-relaxed">
        {filteredLines.map((line) => (
          <div key={line.id} className={cn(
            "mb-0.5",
            line.type === "error" && "text-red-400",
            line.type === "system" && "text-ptero-muted italic",
            line.type === "output" && "text-emerald-300/90",
          )}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-ptero-border shrink-0">
        <span className="text-ptero-accent console-font text-sm shrink-0">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand()}
          placeholder={connected ? "Type a command…" : "Not connected"}
          disabled={!connected}
          className="flex-1 bg-transparent text-ptero-text text-sm placeholder:text-ptero-muted focus:outline-none console-font disabled:opacity-50"
        />
        <button
          onClick={sendCommand}
          disabled={!connected || !command.trim()}
          className="p-2 text-ptero-accent hover:bg-ptero-accent/10 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
