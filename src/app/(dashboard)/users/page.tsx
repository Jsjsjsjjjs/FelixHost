// src/app/(dashboard)/users/page.tsx

import type { Metadata } from "next";
import { UsersContent } from "@/components/dashboard/UsersContent";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <UsersContent />;
}
