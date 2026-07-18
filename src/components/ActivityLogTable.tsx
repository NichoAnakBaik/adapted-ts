"use client";

import React from "react";
import { Activity, Clock, LogIn, LogOut, BookOpen, PenTool, Award, MessageCircle, FileText, ChevronRight } from "lucide-react";

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
      case "LOGIN": return { label: "LOGIN", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: LogIn };
      case "LOGOUT": return { label: "LOGOUT", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: LogOut };
      case "MODULE_ACCESS": return { label: "AKSES MODUL", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: BookOpen };
      case "QUIZ_ATTEMPT": return { label: "MENGERJAKAN KUIS", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: PenTool };
      case "EXAM_ATTEMPT": return { label: "UJIAN AKHIR", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Award };
      case "FORUM_PARTICIPATION": return { label: "FORUM DISKUSI", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: MessageCircle };
      default: return { label: action, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: Activity };
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
          <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-1">Belum Ada Aktivitas</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Riwayat aktivitas akan muncul di sini setelah {role === "SISWA" ? "Anda" : "siswa"} mulai menggunakan platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        let meta: any = {};
        try {
          meta = log.metadata ? JSON.parse(log.metadata) : {};
        } catch (e) {}

        const actionInfo = getActionInfo(log.action_type);
        const Icon = actionInfo.icon;
        const dur = formatDuration(log.duration);

        return (
          <div key={log.id} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 hover:border-namsan-primary transition-colors flex flex-col md:flex-row gap-4 md:items-center">
            
            {/* Waktu & Ikon */}
            <div className="flex items-center gap-4 md:w-48 shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${actionInfo.bg} ${actionInfo.border} ${actionInfo.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">
                  {new Date(log.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Info Siswa (Kecuali Role Siswa) */}
            {role !== "SISWA" && (
              <div className="flex items-center gap-3 md:w-56 shrink-0 md:border-l md:border-gray-100 md:pl-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {log.student?.nama_lengkap?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">{log.student?.nama_lengkap}</div>
                  <div className="text-xs text-gray-500 truncate">@{log.student?.username}</div>
                </div>
              </div>
            )}

            {/* Aktivitas & Metadata */}
            <div className="flex-1 md:border-l md:border-gray-100 md:pl-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-black tracking-wider uppercase ${actionInfo.color}`}>
                  {actionInfo.label}
                </span>
                {meta.className && (
                  <>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      Kelas: {meta.className}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="line-clamp-1">
                  {meta.targetName || meta.title || meta.examTitle || meta.quizTitle || meta.moduleName || "Aktivitas Umum"}
                </span>
              </div>
            </div>

            {/* Durasi (Jika ada) */}
            {dur && (
              <div className="shrink-0 flex justify-end md:w-32">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100/50">
                  <Clock className="w-3.5 h-3.5" /> 
                  {dur}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
