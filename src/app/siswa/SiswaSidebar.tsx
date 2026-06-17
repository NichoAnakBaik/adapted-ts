"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, PenTool, MessageSquare, CalendarCheck, Award, LineChart, LogOut, History, Settings } from "lucide-react";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";

export function SiswaSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/siswa/dashboard", icon: LayoutDashboard },
    { name: "Modul Belajar", href: "/siswa/modul", icon: BookOpen },
    { name: "Kuis Kelas", href: "/siswa/kuis", icon: PenTool },
    { name: "Ujian Akhir", href: "/siswa/ujian", icon: PenTool },
    { name: "Forum Kelas", href: "/siswa/forum", icon: MessageSquare },
    { name: "Sertifikat Level", href: "/siswa/sertifikat", icon: Award },
    { name: "Analitik & AI", href: "/siswa/analitik", icon: LineChart, special: true },
    { name: "Riwayat Belajar", href: "/siswa/aktivitas", icon: History },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0">
        {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-namsan-primary text-white font-bold flex items-center justify-center rounded-md">
          A
        </div>
        <span className="font-bold text-xl tracking-tight text-namsan-text">AdaptEd</span>
      </div>

      {/* Menu Section */}
      <div className="px-4 py-2">
        <p className="text-xs font-bold text-namsan-text-muted mb-4 px-2 uppercase tracking-wider">
          MENU SISWA
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-namsan-soft text-namsan-text"
                    : item.special
                    ? "text-namsan-primary hover:bg-gray-50"
                    : "text-namsan-text-muted hover:bg-gray-50 hover:text-namsan-text"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive || item.special ? "text-namsan-primary" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 p-4 shrink-0">
        {/* User Profile */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 mb-4 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-namsan-blue flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-namsan-text truncate">{user.username}</p>
            <p className="text-xs text-namsan-text-muted capitalize truncate">{user.role.toLowerCase()}</p>
          </div>
          <Settings className="w-4 h-4 text-gray-400 shrink-0" />
        </button>
        {/* Logout Button */}
        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-namsan-red border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
