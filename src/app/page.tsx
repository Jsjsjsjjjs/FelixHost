// src/app/page.tsx

import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";

export default async function RootPage() {
  const user = await getSessionFromCookie();
  redirect(user ? "/dashboard" : "/login");
}
