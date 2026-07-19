"use client";

import React from "react";
import { Activity, Clock, LogIn, LogOut, BookOpen, PenTool, Award, MessageCircle, FileText, ChevronRight, Calendar, User } from "lucide-react";

export default function ActivityLogTable({ logs, role }: { logs: any[], role: "ADMIN" | "PENGAJAR" | "SISWA" }) {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    if (seconds < 60) return `${seconds} dtk`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case "LOGIN": return { label: "LOGIN", color: "text-emerald-600", bg: "bg-emerald-500", lightBg: "bg-emerald-50", border: "border-emerald-200", icon: LogIn };
      case "LOGOUT": return { label: "LOGOUT", color: "text-gray-500", bg: "bg-gray-400", lightBg: "bg-gray-50", border: "border-gray-200", icon: LogOut };
      case "MODULE_ACCESS": return { label: "AKSES MODUL", color: "text-blue-600", bg: "bg-blue-500", lightBg: "bg-blue-50", border: "border-blue-200", icon: BookOpen };
      case "QUIZ_ATTEMPT": return { label: "MENGERJAKAN KUIS", color: "text-purple-600", bg: "bg-purple-500", lightBg: "bg-purple-50", border: "border-purple-200", icon: PenTool };
      case "EXAM_ATTEMPT": return { label: "UJIAN AKHIR", color: "text-orange-600", bg: "bg-orange-500", lightBg: "bg-orange-50", border: "border-orange-200", icon: Award };
      case "FORUM_PARTICIPATION": return { label: "FORUM DISKUSI", color: "text-indigo-600", bg: "bg-indigo-500", lightBg: "bg-indigo-50", border: "border-indigo-200", icon: MessageCircle };
      case "ATTENDANCE_MARKED": return { label: "KEHADIRAN", color: "text-teal-600", bg: "bg-teal-500", lightBg: "bg-teal-50", border: "border-teal-200", icon: Clock };
      default: return { label: action, color: "text-gray-600", bg: "bg-gray-400", lightBg: "bg-gray-50", border: "border-gray-200", icon: Activity };
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-6 shadow-inner">
          <Activity className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-xl mb-2">Belum Ada Aktivitas</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
          Riwayat aktivitas akan muncul di sini setelah {role === "SISWA" ? "Anda" : "siswa"} mulai berinteraksi dengan platform.
        </p>
      </div>
    );
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr = date.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (date.toDateString() === today.toDateString()) dateStr = "Hari Ini";
    else if (date.toDateString() === yesterday.toDateString()) dateStr = "Kemarin";

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(log);
    return acc;
  }, {} as Record<string, any[]>);

  const timelineContent = (
    <div className="relative max-w-4xl mx-auto w-full">
      {/* Main vertical line */}
      <div className="absolute top-0 bottom-0 left-[23px] w-[2px] bg-gradient-to-b from-blue-100 via-gray-100 to-transparent"></div>
      
      {Object.entries(groupedLogs).map(([date, dayLogs], index) => (
        <div key={date} className="relative mb-10">
          
          {/* Date Header */}
          <div className="sticky top-0 z-10 py-2 bg-white/80 backdrop-blur-md mb-6 flex items-center gap-3 ml-[45px]">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
              {date}
            </div>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="space-y-6">
            {(dayLogs as any[]).map((log: any) => {
              let meta: any = {};
              try { meta = log.metadata ? JSON.parse(log.metadata) : {}; } catch (e) {}
              const actionInfo = getActionInfo(log.action_type);
              const Icon = actionInfo.icon;
              const dur = formatDuration(log.duration);
              const fallbackClassName = meta.className || log.student?.enrollments?.[0]?.class?.name;

              return (
                <div key={log.id} className="relative ml-[60px] group">
                  {/* The dot */}
                  <div className={`absolute -left-[48px] top-4 w-6 h-6 rounded-full border-4 border-white ${actionInfo.bg} shadow-sm z-10 transition-transform group-hover:scale-110`}></div>
                  
                  {/* The Card */}
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black tracking-widest uppercase ${actionInfo.color} flex items-center gap-1.5`}>
                            <Icon className="w-3.5 h-3.5" />
                            {actionInfo.label}
                          </span>
                        </div>
                        <div className="text-[15px] md:text-base font-bold text-gray-900 leading-snug">
                          {meta.targetName || meta.title || meta.examTitle || meta.quizTitle || meta.moduleName || 
                           (log.action_type === "LOGIN" ? "Siswa berhasil masuk ke sistem" : 
                            log.action_type === "LOGOUT" ? "Siswa keluar dari sistem" :
                            log.action_type === "QUIZ_ATTEMPT" ? "Menyelesaikan Kuis/Latihan" :
                            log.action_type === "EXAM_ATTEMPT" ? "Mengerjakan Ujian Akhir" :
                            log.action_type === "FORUM_PARTICIPATION" ? "Berpartisipasi dalam Forum Kelas" :
                            log.action_type === "MODULE_ACCESS" ? "Membaca Materi Pembelajaran" : 
                            log.action_type === "ATTENDANCE_MARKED" ? "Tanda Kehadiran (Absensi)" :
                            "Aktivitas Sistem Umum")}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                          {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {/* Show student info for ADMIN and PENGAJAR */}
                        {(role === "ADMIN" || role === "PENGAJAR") && (
                          <div className="flex items-center gap-2 mt-1 bg-gray-50/50 p-1.5 pr-3 rounded-full border border-gray-100">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {log.student?.nama_lengkap?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-xs font-bold text-gray-800 leading-none">{log.student?.nama_lengkap || "Unknown User"}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                      {fallbackClassName && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
                          <BookOpen className="w-3.5 h-3.5" /> Kelas: <span className="font-bold text-gray-700 group-hover:text-blue-700">{fallbackClassName}</span>
                        </div>
                      )}
                      {dur && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 font-bold px-2 py-0.5 rounded-md border border-orange-100">
                          <Clock className="w-3.5 h-3.5" /> {dur}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  if (role === "SISWA") {
    return timelineContent;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg md:text-xl tracking-tight">
              {role === "ADMIN" ? "Log Sistem Terpadu" : "Feed Aktivitas Terkini"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {role === "ADMIN" ? "Rekaman seluruh aktivitas platform secara real-time" : "Pantau riwayat belajar siswa di kelas Anda"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-gray-700 font-bold text-sm">{logs.length} Total Data</span>
        </div>
      </div>
      
      {/* Body with subtle padding */}
      <div className="p-4 md:p-8 bg-gray-50/30">
        {timelineContent}
      </div>
    </div>
  );
}
