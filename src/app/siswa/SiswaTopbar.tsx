import React from "react";
import { NotificationBell } from "@/components/NotificationBell";

export function SiswaTopbar() {
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="text-right">
          <p className="text-xs font-bold text-namsan-text">Kelas Saat Ini</p>
          <p className="text-sm text-namsan-primary font-medium">Level 1 - Kelas A</p>
        </div>
      </div>
    </header>
  );
}
