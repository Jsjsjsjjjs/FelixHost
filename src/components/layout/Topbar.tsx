// src/components/layout/Topbar.tsx
"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui";

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 border-b border-ptero-border bg-ptero-surface/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4">
      <button
        onClick={toggleSidebar}
        className="text-ptero-muted hover:text-ptero-text transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ptero-muted" />
          <input
            type="text"
            placeholder="Search servers..."
            className="w-full bg-ptero-elevated border border-ptero-border rounded-md pl-9 pr-4 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50 focus:border-ptero-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 text-ptero-muted hover:text-ptero-text hover:bg-ptero-elevated rounded-md transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ptero-accent rounded-full" />
        </button>
      </div>
    </header>
  );
}
