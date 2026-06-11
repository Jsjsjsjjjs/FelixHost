// src/components/dashboard/UsersContent.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Shield, Calendar, Mail, RefreshCw } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "@/store/ui";

interface UserRecord {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

const ROLES = ["VIEWER", "MODERATOR", "ADMIN", "OWNER"] as const;
type Role = (typeof ROLES)[number];

const roleColors: Record<Role, string> = {
  OWNER: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  ADMIN: "text-red-400 bg-red-500/10 border-red-500/20",
  MODERATOR: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  VIEWER: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export function UsersContent() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "VIEWER" as Role });
  const qc = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery<UserRecord[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    onSuccess: () => {
      toast.success("User created");
      setForm({ email: "", username: "", password: "", role: "VIEWER" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => toast.error("Failed to create user", err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Users</h1>
          <p className="text-sm text-ptero-muted mt-0.5">Manage panel access and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-ptero-muted hover:text-ptero-text rounded-md hover:bg-ptero-elevated transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-ptero-accent text-white hover:bg-ptero-accent/80 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Create user form */}
      {showForm && (
        <div className="p-5 rounded-xl border border-ptero-border bg-ptero-surface animate-fade-in">
          <h3 className="font-semibold text-ptero-text mb-4">New User</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "email", label: "Email", type: "email", placeholder: "user@example.com" },
              { key: "username", label: "Username", type: "text", placeholder: "username" },
              { key: "password", label: "Password", type: "password", placeholder: "Min 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-ptero-muted mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  minLength={key === "password" ? 8 : undefined}
                  className="w-full bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-ptero-muted mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                className="w-full bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 rounded-md text-sm bg-ptero-accent text-white hover:bg-ptero-accent/80 transition-all disabled:opacity-60"
              >
                {createMutation.isPending ? "Creating…" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md text-sm border border-ptero-border text-ptero-muted hover:text-ptero-text transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-xl border border-ptero-border bg-ptero-surface overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_120px_160px] gap-4 px-5 py-3 border-b border-ptero-border text-xs text-ptero-muted font-medium">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Last Login</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-ptero-muted text-sm">Loading users…</div>
        ) : users?.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 mx-auto mb-2 text-ptero-muted opacity-30" />
            <p className="text-ptero-muted text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-ptero-border/40">
            {users?.map((user) => (
              <div key={user.id} className="grid grid-cols-[1fr_1fr_120px_160px] gap-4 px-5 py-4 hover:bg-ptero-elevated/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-ptero-accent/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-ptero-accent">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-ptero-text truncate">{user.username}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-ptero-muted shrink-0" />
                  <span className="text-sm text-ptero-muted truncate">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full border font-medium",
                    roleColors[user.role as Role] ?? roleColors.VIEWER
                  )}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ptero-muted shrink-0" />
                  <span className="text-xs text-ptero-muted">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
