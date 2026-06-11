// src/app/(dashboard)/settings/page.tsx

import type { Metadata } from "next";
import { SettingsContent } from "@/components/dashboard/SettingsContent";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsContent />;
}
