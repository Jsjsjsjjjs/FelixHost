// src/components/console/ConsolePageContent.tsx
"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ConsoleView } from "./ConsoleView";
import { useQuery } from "@tanstack/react-query";

interface ConsolePageContentProps {
  identifier: string;
}

export function ConsolePageContent({ identifier }: ConsolePageContentProps) {
  const { data } = useQuery({
    queryKey: ["server", identifier],
    queryFn: async () => {
      const res = await fetch(`/api/servers/${identifier}`);
      if (!res.ok) return null;
      return (await res.json()).data;
    },
  });

  const serverName = data?.server?.name ?? identifier;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link
          href={`/servers/${identifier}`}
          className="inline-flex items-center gap-1.5 text-sm text-ptero-muted hover:text-ptero-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {serverName}
        </Link>
        <span className="text-ptero-muted">/</span>
        <span className="text-sm text-ptero-text">Console</span>
      </div>

      {/* Console takes remaining height */}
      <div className="flex-1 min-h-0">
        <ConsoleView identifier={identifier} />
      </div>
    </div>
  );
}
