"use client";

import React from "react";
import { Activity, Clock, FileText } from "lucide-react";

export default function ActivityLogTable({ logs, role }: { logs: any[], role: "ADMIN" | "PENGAJAR" | "SISWA" }) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} detik`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatAction = (action: string) => {
    switch (action) {
      case "READ_MODULE": return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold text-xs">BACA MODUL</span>;
      case "WATCH_VIDEO": return <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded font-bold text-xs">NONTON VIDEO</span>;
      case "TAKE_EXAM": return <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold text-xs">UJI KEMAMPUAN</span>;
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded font-bold text-xs">{action}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-sm">
            <th className="p-4 font-bold text-namsan-text-muted">Tanggal & Waktu</th>
            {role !== "SISWA" && <th className="p-4 font-bold text-namsan-text-muted">Siswa</th>}
            <th className="p-4 font-bold text-namsan-text-muted">Kelas</th>
            <th className="p-4 font-bold text-namsan-text-muted">Aksi</th>
            <th className="p-4 font-bold text-namsan-text-muted">Modul / Detail</th>
            <th className="p-4 font-bold text-namsan-text-muted">Durasi</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            let metadataObj: any = {};
            try {
              metadataObj = log.metadata ? JSON.parse(log.metadata) : {};
            } catch (e) {}

            return (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </td>
                {role !== "SISWA" && (
                  <td className="p-4 font-medium text-namsan-text">
                    {log.student?.nama_lengkap} <span className="text-xs text-gray-400 font-normal">@{log.student?.username}</span>
                  </td>
                )}
                <td className="p-4 text-sm font-medium text-gray-700">{metadataObj.className || "-"}</td>
                <td className="p-4">{formatAction(log.action_type)}</td>
                <td className="p-4 text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> {metadataObj.targetName || "Umum"}
                </td>
                <td className="p-4 text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-400" /> {formatDuration(log.duration || 0)}
                </td>
              </tr>
            );
          })}
          {logs.length === 0 && (
            <tr>
              <td colSpan={role === "SISWA" ? 5 : 6} className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Activity className="w-8 h-8 text-gray-300" />
                  <p>Belum ada data riwayat aktivitas.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
