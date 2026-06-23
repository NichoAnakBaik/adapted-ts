import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/?login=true");
  }

  return (
    <DashboardLayoutClient
      sidebar={<AdminSidebar user={session.user} />}
      topbar={<AdminTopbar />}
    >
      {children}
    </DashboardLayoutClient>
  );
}
