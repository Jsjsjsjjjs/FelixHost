// src/store/auth.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSession } from "@/types";

interface AuthState {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: "pterocontrol_auth" }
  )
);
