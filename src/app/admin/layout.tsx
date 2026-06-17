import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  console.log("AdminLayout() -> session:", session);
  
  if (!session) {
    console.log("AdminLayout() -> No session, redirecting to /login");
    redirect("/login");
  }
  
  if (session.user?.role !== "ADMIN") {
    console.log("AdminLayout() -> Role mismatch, redirecting. Expected ADMIN, got:", session.user?.role);
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-namsan-bg-alt">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold text-namsan-primary mb-6">AdapteEd Admin</h2>
        <nav className="space-y-2">
          <a href="/admin/dashboard" className="block px-4 py-2 rounded bg-namsan-primary/10 text-namsan-text font-medium">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Plotting Kelas
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Manage User
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Logbook Siswa
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100 text-namsan-text-muted">
            Approval Sertifikat
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
