// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Users,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/users", label: "Users", icon: Users, minRole: "ADMIN" },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ROLE_LEVELS: Record<string, number> = {
  VIEWER: 1, MODERATOR: 2, ADMIN: 3, OWNER: 4,
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, clear } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    router.push("/login");
  }

  const userLevel = ROLE_LEVELS[user?.role ?? "VIEWER"] ?? 1;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300",
        "bg-ptero-surface border-r border-ptero-border",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-ptero-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ptero-accent flex items-center justify-center shrink-0 glow-accent">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-ptero-text truncate tracking-tight">
              PteroControl
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className={cn(
            "ml-auto text-ptero-muted hover:text-ptero-text transition-colors",
            !sidebarOpen && "rotate-180"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map(({ href, label, icon: Icon, minRole }) => {
            const requiredLevel = ROLE_LEVELS[minRole ?? "VIEWER"] ?? 1;
            if (userLevel < requiredLevel) return null;

            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                    active
                      ? "bg-ptero-accent/15 text-ptero-accent"
                      : "text-ptero-muted hover:text-ptero-text hover:bg-ptero-elevated"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5 shrink-0", active && "text-ptero-accent")}
                  />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-ptero-border p-3 shrink-0">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-ptero-accent/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-ptero-accent">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ptero-text truncate">{user.username}</p>
              <p className="text-xs text-ptero-muted truncate flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {user.role}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
            "text-ptero-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
