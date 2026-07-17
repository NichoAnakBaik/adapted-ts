"use client";

import React from "react";
import { Activity, Clock, FileText, LogIn, LogOut, BookOpen, PenTool, Award, MessageCircle } from "lucide-react";

export default function ActivityLogTable({ logs, role }: { logs: any[], role: "ADMIN" | "PENGAJAR" | "SISWA" }) {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds} dtk`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case "LOGIN": return { label: "LOGIN", color: "text-emerald-700 bg-emerald-100", icon: LogIn };
      case "LOGOUT": return { label: "LOGOUT", color: "text-gray-600 bg-gray-100", icon: LogOut };
      case "MODULE_ACCESS": return { label: "AKSES MODUL", color: "text-blue-700 bg-blue-100", icon: BookOpen };
      case "QUIZ_ATTEMPT": return { label: "KUIS", color: "text-purple-700 bg-purple-100", icon: PenTool };
      case "EXAM_ATTEMPT": return { label: "UJIAN", color: "text-orange-700 bg-orange-100", icon: Award };
      case "FORUM_PARTICIPATION": return { label: "FORUM", color: "text-indigo-700 bg-indigo-100", icon: MessageCircle };
      default: return { label: action, color: "text-gray-600 bg-gray-100", icon: Activity };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] inline-block align-middle">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="py-4 px-5 text-xs font-black text-gray-500 uppercase tracking-wider w-48">Waktu</th>
                {role !== "SISWA" && <th className="py-4 px-5 text-xs font-black text-gray-500 uppercase tracking-wider w-56">Siswa</th>}
                <th className="py-4 px-5 text-xs font-black text-gray-500 uppercase tracking-wider w-48">Aktivitas</th>
                <th className="py-4 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Detail Informasi</th>
                <th className="py-4 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-right w-32">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                let metadataObj: any = {};
                try {
                  metadataObj = log.metadata ? JSON.parse(log.metadata) : {};
                } catch (e) {}

                const actionInfo = getActionInfo(log.action_type);
                const Icon = actionInfo.icon;

                return (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-5 text-sm text-gray-500">
                      <div className="font-bold text-gray-700">
                        {new Date(log.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    {role !== "SISWA" && (
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                            {log.student?.nama_lengkap?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">{log.student?.nama_lengkap}</div>
                            <div className="text-xs text-gray-500 truncate">@{log.student?.username}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black tracking-wide ${actionInfo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600">
                      <div className="flex flex-col gap-0.5">
                        {metadataObj.className && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {metadataObj.className}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" /> 
                          <span className="font-medium text-gray-700">{metadataObj.targetName || metadataObj.title || "Umum"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {log.duration ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-bold border border-orange-100/50">
                          <Clock className="w-4 h-4" /> 
                          {formatDuration(log.duration)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={role === "SISWA" ? 4 : 5} className="py-12 px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                      <Activity className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg mb-1">Belum Ada Aktivitas</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Riwayat aktivitas akan muncul di sini setelah {role === "SISWA" ? "Anda" : "siswa"} mulai menggunakan platform.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
