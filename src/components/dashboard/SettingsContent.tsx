// src/components/dashboard/SettingsContent.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Settings, Key, Shield, CheckCircle } from "lucide-react";
import { toast } from "@/store/ui";

export function SettingsContent() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed");
      }
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => toast.error("Failed to change password", err.message),
  });

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ptero-text tracking-tight">Settings</h1>
        <p className="text-sm text-ptero-muted mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Security settings */}
      <div className="rounded-xl border border-ptero-border bg-ptero-surface p-5">
        <h2 className="font-semibold text-ptero-text mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-ptero-accent" />
          Security
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ptero-muted mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ptero-muted mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="w-full bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ptero-muted mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Repeat new password"
              className="w-full bg-ptero-elevated border border-ptero-border rounded-md px-3 py-2 text-sm text-ptero-text placeholder:text-ptero-muted focus:outline-none focus:ring-1 focus:ring-ptero-accent/50"
            />
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-ptero-accent text-white hover:bg-ptero-accent/80 transition-all disabled:opacity-60"
          >
            <Key className="w-4 h-4" />
            {changePasswordMutation.isPending ? "Updating…" : "Change Password"}
          </button>
        </form>
      </div>

      {/* API info */}
      <div className="rounded-xl border border-ptero-border bg-ptero-surface p-5">
        <h2 className="font-semibold text-ptero-text mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-ptero-accent" />
          Configuration
        </h2>
        <div className="space-y-3">
          {[
            { label: "Pterodactyl URL", value: "Configured via PTERODACTYL_URL env var" },
            { label: "Application API Key", value: "Configured via PTERODACTYL_APP_KEY env var" },
            { label: "Client API Key", value: "Configured via PTERODACTYL_CLIENT_KEY env var" },
            { label: "Database", value: "PostgreSQL via DATABASE_URL env var" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <dt className="text-sm text-ptero-muted shrink-0">{label}</dt>
              <dd className="text-sm text-ptero-text text-right flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {value}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
