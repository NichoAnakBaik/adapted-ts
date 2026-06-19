import React from "react";
import { GraduationCap } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export function PengajarTopbar() {
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="text-right flex items-center gap-3">
          <div>
            <p className="text-xs font-bold text-namsan-text">Semester Aktif</p>
            <p className="text-sm text-namsan-primary font-medium">Ganjil 2026</p>
          </div>
          <GraduationCap className="w-8 h-8 text-namsan-primary bg-yellow-50 p-1 rounded-md" />
        </div>
      </div>
    </header>
  );
}
