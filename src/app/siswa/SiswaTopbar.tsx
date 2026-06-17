import React from "react";
import { Bell } from "lucide-react";

export function SiswaTopbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-6">
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-namsan-text hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="text-right">
          <p className="text-xs font-bold text-namsan-text">Kelas Saat Ini</p>
          <p className="text-sm text-namsan-primary font-medium">Level 1 - Kelas A</p>
        </div>
      </div>
    </header>
  );
}
