// src/app/(dashboard)/servers/[id]/page.tsx

import type { Metadata } from "next";
import { ServerDetailContent } from "@/components/servers/ServerDetailContent";

export const metadata: Metadata = { title: "Server Details" };

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServerDetailContent identifier={id} />;
}
