import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PengajarSidebar } from "./PengajarSidebar";
import { PengajarTopbar } from "./PengajarTopbar";

export default async function PengajarLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "PENGAJAR") {
    redirect("/login");
  }

  return (
    <div className="h-screen flex bg-namsan-bg font-sans overflow-hidden">
      <PengajarSidebar user={session.user} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <PengajarTopbar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
