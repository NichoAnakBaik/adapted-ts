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

  // === RENDER SISWA (Learning Journey Timeline) ===
  if (role === "SISWA") {
    return (
      <div className="space-y-8 max-w-3xl">
        {Object.entries(groupedLogs).map(([date, dayLogs], index) => (
          <div key={date} className="relative">
            <div className="sticky top-0 z-10 py-2 bg-white/80 backdrop-blur-md mb-4 flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                {date}
              </div>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="relative pl-6 space-y-6">
              <div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-gradient-to-b from-blue-100 via-gray-100 to-transparent"></div>
              
              {(dayLogs as any[]).map((log: any) => {
                let meta: any = {};
                try { meta = log.metadata ? JSON.parse(log.metadata) : {}; } catch (e) {}
                const actionInfo = getActionInfo(log.action_type);
                const Icon = actionInfo.icon;
                const dur = formatDuration(log.duration);

                return (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 border-white ${actionInfo.bg} shadow-sm z-10 transition-transform group-hover:scale-110`}></div>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black tracking-widest uppercase ${actionInfo.color} flex items-center gap-1.5`}>
                            <Icon className="w-3.5 h-3.5" />
                            {actionInfo.label}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                          {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="text-[15px] font-bold text-gray-900 mb-1 leading-snug">
                        {meta.targetName || meta.title || meta.examTitle || meta.quizTitle || meta.moduleName || "Aktivitas Umum"}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {meta.className && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <BookOpen className="w-3.5 h-3.5" /> Kelas: {meta.className}
                          </div>
                        )}
                        {dur && (
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 font-bold px-2 py-0.5 rounded-md">
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
  }

  // === RENDER ADMIN & PENGAJAR (Social / Monitoring Feed) ===
  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-lg">Feed Aktivitas Terkini</h3>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{logs.length} Data</span>
      </div>

      <div className="divide-y divide-gray-50">
        {logs.map((log) => {
          let meta: any = {};
          try { meta = log.metadata ? JSON.parse(log.metadata) : {}; } catch (e) {}
          const actionInfo = getActionInfo(log.action_type);
          const Icon = actionInfo.icon;
          const dur = formatDuration(log.duration);

          return (
            <div key={log.id} className="p-4 md:p-6 hover:bg-gray-50/80 transition-colors flex gap-4 md:gap-6 group">
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                  {log.student?.nama_lengkap?.charAt(0).toUpperCase()}
                </div>
                <div className={`w-1 flex-1 ${actionInfo.bg} opacity-20 rounded-full my-1 min-h-[20px]`}></div>
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">{log.student?.nama_lengkap}</span>
                    <span className="text-gray-400 text-sm">@{log.student?.username}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-sm w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}, {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${actionInfo.lightBg} ${actionInfo.border} mb-3`}>
                  <Icon className={`w-4 h-4 ${actionInfo.color}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${actionInfo.color}`}>
                    {actionInfo.label}
                  </span>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="font-semibold text-gray-800 text-sm md:text-base leading-snug mb-2">
                    {meta.targetName || meta.title || meta.examTitle || meta.quizTitle || meta.moduleName || "Melakukan aktivitas sistem"}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                    {meta.className && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Kelas: <span className="text-gray-700">{meta.className}</span>
                      </div>
                    )}
                    {dur && (
                      <div className="flex items-center gap-1.5 text-orange-600">
                        <Clock className="w-3.5 h-3.5" /> Durasi: {dur}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
