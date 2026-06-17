import React from "react";
import { Bell, Shield } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="flex items-center justify-end px-4 lg:px-8 shrink-0 w-full">
      <div className="flex items-center gap-6">
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-namsan-text hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-namsan-red rounded-full"></span>
        </button>
        <div className="text-right flex items-center gap-3">
          <div>
            <p className="text-xs font-bold text-namsan-text">Status Sistem</p>
            <p className="text-sm text-green-600 font-medium">Online & Aman</p>
          </div>
          <Shield className="w-8 h-8 text-green-600 bg-green-50 p-1.5 rounded-md" />
        </div>
      </div>
    </header>
  );
}
