// src/app/(dashboard)/servers/[id]/backups/page.tsx

import type { Metadata } from "next";
import { BackupsContent } from "@/components/servers/BackupsContent";

export const metadata: Metadata = { title: "Backups" };

export default async function BackupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BackupsContent identifier={id} />;
}
