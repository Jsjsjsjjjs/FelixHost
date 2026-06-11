// src/app/(dashboard)/servers/page.tsx

import type { Metadata } from "next";
import { ServersContent } from "@/components/servers/ServersContent";

export const metadata: Metadata = { title: "Servers" };

export default function ServersPage() {
  return <ServersContent />;
}
