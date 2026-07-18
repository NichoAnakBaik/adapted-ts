"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Users, RefreshCw, Calendar as CalendarIcon, Eye, X } from "lucide-react";
import { getAdminAttendanceSessions, getSessionAttendances } from "@/app/actions/absensi";

export default function AdminAbsensiClient({ classes }: { classes: any[] }) {
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].id : "");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // View Attendance state
  const [viewingSession, setViewingSession] = useState<any | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  useEffect(() => {
    if (selectedClass) loadSessions();
  }, [selectedClass]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getAdminAttendanceSessions(selectedClass);
      setSessions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadAttendancesForSession = async (s: any) => {
    setViewingSession(s);
    setLoadingAttendances(true);
    const data = await getSessionAttendances(s.id);
    setAttendances(data);
    setLoadingAttendances(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-namsan-text flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-teal-500" /> Pantau Absensi Global
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pantau jadwal pertemuan dan tingkat kehadiran siswa di seluruh kelas.</p>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-gray-600 mb-1">Pilih Kelas</label>
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-2 focus:ring-namsan-primary/20 outline-none font-medium text-sm transition-all"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {classes.length === 0 && <option value="">Tidak ada kelas</option>}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 md:p-16 text-center border-2 border-dashed border-gray-200">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Sesi Pertemuan</h3>
          <p className="text-gray-500 text-sm">Pengajar kelas ini belum menyiapkan jadwal sesi absensi.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-namsan-text flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" /> Daftar Sesi Kelas ({sessions.length} Sesi)
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-bold text-namsan-text">{s.title}</span>
                    {s.date ? (
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 bg-red-50 text-red-600 rounded-md border border-red-100">Tanggal belum diatur</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{s.description || "Tidak ada deskripsi/materi yang dicatat."}</p>
                </div>
                
                <div className="flex items-center gap-2 md:pl-4 md:border-l border-gray-100">
                  <button onClick={() => loadAttendancesForSession(s)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-namsan-text font-bold text-xs rounded-lg hover:border-namsan-primary hover:text-namsan-primary transition-colors">
                    <Eye className="w-4 h-4" /> Cek Kehadiran ({s._count?.attendances || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewing Session Attendances Modal */}
      {viewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-namsan-text flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" /> Kehadiran: {viewingSession.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{viewingSession.date ? new Date(viewingSession.date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : 'Tanggal belum diatur'}</p>
              </div>
              <button onClick={() => setViewingSession(null)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {loadingAttendances ? (
                <div className="py-16 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : attendances.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Belum ada siswa yang melakukan absen pada sesi ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {attendances.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                          {a.student.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{a.student.nama_lengkap}</div>
                          <div className="text-xs text-gray-400">@{a.student.username}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-green-100 uppercase tracking-wider">Hadir</span>
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(a.check_in_time).toLocaleTimeString('id-ID', { timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
