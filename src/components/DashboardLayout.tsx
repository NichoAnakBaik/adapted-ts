'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
  user,
  role
}: {
  children: ReactNode;
  user: any;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-2xl font-bold text-blue-600">AdaptEd.</span>
        </div>
        
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Menu {role}
          </p>
          <nav className="space-y-2">
            {role === 'siswa' && (
              <>
                <Link href="/siswa/dashboard" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/siswa/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Dashboard
                </Link>
                <Link href="/siswa/modul" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/siswa/modul' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Modul Materi
                </Link>
                <Link href="/siswa/kuis" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/siswa/kuis' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Daftar Kuis
                </Link>
                <Link href="/siswa/absensi" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/siswa/absensi' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Riwayat Absensi
                </Link>
                <Link href="/forum" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname.startsWith('/forum') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Forum Terpadu
                </Link>
              </>
            )}
            {role === 'pengajar' && (
              <>
                <Link href="/pengajar/dashboard" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/pengajar/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Dashboard
                </Link>
                <Link href="/forum" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname.startsWith('/forum') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Forum
                </Link>
              </>
            )}
            {role === 'admin' && (
              <>
                <Link href="/admin/dashboard" className={`block px-4 py-2 rounded-lg text-sm font-medium ${pathname === '/admin/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Dashboard Admin
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.nama?.[0] || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.nama}</p>
              <form action="/api/logout" method="POST">
                <button type="submit" className="text-xs text-red-500 hover:text-red-700">Logout</button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
           <span className="text-xl font-bold text-blue-600">AdaptEd.</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
