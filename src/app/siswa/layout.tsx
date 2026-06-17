import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiswaSidebar } from "./SiswaSidebar";
import { SiswaTopbar } from "./SiswaTopbar";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  return (
    <div className="h-screen flex bg-namsan-bg font-sans overflow-hidden">
      <SiswaSidebar user={session.user} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <SiswaTopbar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
