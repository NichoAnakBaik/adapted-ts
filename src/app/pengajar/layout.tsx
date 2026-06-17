import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PengajarSidebar } from "./PengajarSidebar";
import { PengajarTopbar } from "./PengajarTopbar";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function PengajarLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "PENGAJAR") {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient
      sidebar={<PengajarSidebar user={session.user} />}
      topbar={<PengajarTopbar />}
    >
      {children}
    </DashboardLayoutClient>
  );
}
