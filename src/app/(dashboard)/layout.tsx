// src/app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthHydrate } from "@/components/layout/AuthHydrate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionFromCookie();
  if (!user) redirect("/login");

  return (
    <AuthHydrate user={user}>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 pl-64">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthHydrate>
  );
}
