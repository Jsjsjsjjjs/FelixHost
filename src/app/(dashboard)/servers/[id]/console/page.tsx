// src/app/(dashboard)/servers/[id]/console/page.tsx

import type { Metadata } from "next";
import { ConsolePageContent } from "@/components/console/ConsolePageContent";

export const metadata: Metadata = { title: "Console" };

export default async function ConsolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConsolePageContent identifier={id} />;
}
