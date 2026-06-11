// src/app/(dashboard)/activity/page.tsx

import type { Metadata } from "next";
import { ActivityContent } from "@/components/dashboard/ActivityContent";

export const metadata: Metadata = { title: "Activity" };

export default function ActivityPage() {
  return <ActivityContent />;
}
