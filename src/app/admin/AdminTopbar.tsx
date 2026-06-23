import React from "react";
import { Shield } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileButton } from "@/components/ProfileButton";
import { getSession } from "@/lib/auth";

export async function AdminTopbar() {
  const session = await getSession();
  
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-4 md:gap-6">
        <NotificationBell />
        <div className="text-right flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-xs font-bold text-namsan-text">Status Sistem</p>
            <p className="text-sm text-green-600 font-medium">Online & Aman</p>
          </div>
          <Shield className="w-8 h-8 text-green-600 bg-green-50 p-1.5 rounded-md hidden md:block" />
        </div>
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        {session?.user && (
          <ProfileButton username={session.user.username} role={session.user.role} />
        )}
      </div>
    </header>
  );
}
