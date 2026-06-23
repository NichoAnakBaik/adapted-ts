import React from "react";
import { Calendar } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileButton } from "@/components/ProfileButton";
import { getSession } from "@/lib/auth";

export async function PengajarTopbar() {
  const session = await getSession();
  
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-4 md:gap-6">
        <NotificationBell />
        <div className="text-right flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-xs font-bold text-namsan-text">Tahun Ajaran</p>
            <p className="text-sm text-namsan-primary font-medium">2026/2027 Ganjil</p>
          </div>
          <Calendar className="w-8 h-8 text-namsan-primary bg-namsan-soft p-1.5 rounded-md hidden md:block" />
        </div>
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        {session?.user && (
          <ProfileButton username={session.user.username} role={session.user.role} />
        )}
      </div>
    </header>
  );
}
