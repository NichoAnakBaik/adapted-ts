"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import ProfileSettingsModal from "./ProfileSettingsModal";

export function ProfileButton({ username, role }: { username: string, role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 hover:bg-gray-50 p-1 md:p-1.5 rounded-xl transition-colors border border-transparent hover:border-gray-200"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-namsan-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          {username?.substring(0, 2).toUpperCase() || "US"}
        </div>
        <div className="hidden md:block text-left mr-1">
          <p className="text-sm font-bold text-namsan-text leading-none mb-0.5 truncate max-w-[120px]">{username || "User"}</p>
          <p className="text-[10px] text-namsan-text-muted capitalize leading-none">{role?.toLowerCase() || "user"}</p>
        </div>
        <Settings className="w-4 h-4 text-gray-400 hidden md:block" />
      </button>
      
      <ProfileSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
