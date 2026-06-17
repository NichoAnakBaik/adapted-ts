import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiswaSidebar } from "./SiswaSidebar";
import { SiswaTopbar } from "./SiswaTopbar";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient
      sidebar={<SiswaSidebar user={session.user} />}
      topbar={<SiswaTopbar />}
    >
      {children}
    </DashboardLayoutClient>
  );
}
