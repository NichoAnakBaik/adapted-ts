import React from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { Trophy } from "lucide-react";

export function SiswaTopbar() {
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="text-right flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-xs font-bold text-namsan-text">Level Saat Ini</p>
            <p className="text-sm text-namsan-blue font-bold">1 - Beginner</p>
          </div>
          <Trophy className="w-8 h-8 text-namsan-blue bg-blue-50 p-1.5 rounded-md" />
        </div>
      </div>
    </header>
  );
}
