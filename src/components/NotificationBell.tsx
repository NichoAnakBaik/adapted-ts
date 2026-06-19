"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Info } from "lucide-react";
import { getUserNotifications, markNotificationAsRead } from "@/app/actions/notification";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await getUserNotifications();
    if (res.notifications) {
      setNotifications(res.notifications);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      const res = await markNotificationAsRead(notif.id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-namsan-text hover:bg-gray-100 transition-colors relative focus:outline-none focus:ring-2 focus:ring-namsan-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-namsan-red rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-namsan-text">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-namsan-primary bg-blue-50 px-2 py-1 rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin w-5 h-5 border-2 border-namsan-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Memuat...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => {
                  const content = (
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.is_read ? "bg-gray-100" : "bg-blue-50"}`}>
                          <Info className={`w-4 h-4 ${notif.is_read ? "text-gray-400" : "text-namsan-primary"}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notif.is_read ? "text-gray-600" : "text-namsan-text"}`}>
                          {notif.title}
                        </p>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${notif.is_read ? "text-gray-400" : "text-gray-500"}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-medium">
                          {new Date(notif.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="shrink-0 flex items-center">
                          <div className="w-2 h-2 bg-namsan-primary rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );

                  return notif.link ? (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${notif.is_read ? "opacity-70" : ""}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notif.is_read ? "opacity-70" : ""}`}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
