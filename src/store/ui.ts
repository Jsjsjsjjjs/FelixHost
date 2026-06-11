// src/store/ui.ts

import { create } from "zustand";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  selectedServerId: string | null;
  setSelectedServer: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  selectedServerId: null,
  setSelectedServer: (id) => set({ selectedServerId: id }),
}));

// Convenience helpers
export const toast = {
  success: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "info", title, message }),
};
