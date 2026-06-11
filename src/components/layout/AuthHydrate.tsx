// src/components/layout/AuthHydrate.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { UserSession } from "@/types";

export function AuthHydrate({
  user,
  children,
}: {
  user: UserSession;
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}
