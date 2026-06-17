import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function PengajarLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "PENGAJAR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-namsan-bg-alt">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold text-namsan-primary mb-6">AdapteEd Pengajar</h2>
        <nav className="space-y-2">
          <a href="/pengajar/dashboard" className="block px-4 py-2 rounded bg-namsan-primary/10 text-namsan-text font-medium">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Kelas Saya
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Modul Pembelajaran
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Kuis & Ujian
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Analitik Kelas
          </a>
        </nav>
        <div className="mt-8 border-t pt-4">
          <form action={logoutAction}>
            <button type="submit" className="w-full text-left px-4 py-2 rounded text-namsan-red hover:bg-red-50">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
