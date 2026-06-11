// src/app/(dashboard)/servers/[id]/files/page.tsx

import type { Metadata } from "next";
import { FileManagerContent } from "@/components/servers/FileManagerContent";

export const metadata: Metadata = { title: "File Manager" };

export default async function FilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FileManagerContent identifier={id} />;
}
