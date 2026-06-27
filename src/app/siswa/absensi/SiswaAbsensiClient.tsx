"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, MapPin, Video, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { getStudentAttendanceSessions, studentMarkAttendance } from "@/app/actions/absensi";

export default function SiswaAbsensiClient({ classes }: { classes: any[] }) {
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].id : "");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClass) loadSessions();
  }, [selectedClass]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getStudentAttendanceSessions(selectedClass);
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarkAttendance = async (sessionId: string) => {
    setLoadingId(sessionId);
    setError(null);
    try {
      const res = await studentMarkAttendance(sessionId);
      if (res.error) {
        setError(res.error);
      } else {
        await loadSessions();
      }
    } catch (e) {
      setError("Gagal merekam absensi.");
    }
    setLoadingId(null);
  };

  const localNow = new Date();
  const tzOffset = localNow.getTimezoneOffset() * 60000;
  const todayStr = new Date(localNow.getTime() - tzOffset).toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-namsan-text flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-teal-500" /> Kehadiran Kelas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Isi absen dengan menekan tombol Hadir pada sesi yang dijadwalkan hari ini.</p>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-gray-600 mb-1">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-2 focus:ring-namsan-primary/20 outline-none font-bold text-sm text-namsan-text transition-all"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            {classes.length === 0 && <option value="">Belum ada kelas</option>}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Jadwal Sesi Belum Dibuat</h3>
          <p className="text-gray-500 text-sm">Pengajar belum menyiapkan jadwal sesi pertemuan untuk kelas ini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => {
              const sDateStr = s.date ? new Date(s.date).toISOString().split('T')[0] : null;
              const isToday = sDateStr === todayStr;
              const isPast = sDateStr && sDateStr < todayStr;
              const isFuture = sDateStr && sDateStr > todayStr;
              const hasAttended = s.attendances && s.attendances.length > 0;
              const isProcessing = loadingId === s.id;

              return (
                <div key={s.id} className={`p-5 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${isToday ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-bold text-namsan-text">{s.title}</span>
                      {s.date ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          isToday ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-600 rounded-md border border-orange-100">Jadwal Menyusul</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{s.description || "Topik belum ditentukan."}</p>
                  </div>

                  <div className="w-full md:w-auto">
                    {!s.date ? (
                      <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl text-center">Menunggu Jadwal</div>
                    ) : hasAttended ? (
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-700 bg-green-50 border border-green-100 px-4 py-2.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> Hadir ({new Date(s.attendances[0].check_in_time).toLocaleTimeString('id-ID', { timeStyle: 'short' })})
                      </div>
                    ) : isToday ? (
                      <button 
                        onClick={() => handleMarkAttendance(s.id)}
                        disabled={isProcessing}
                        className="w-full md:w-auto bg-namsan-primary hover:bg-namsan-primary/90 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Hadir ✅"}
                      </button>
                    ) : isPast ? (
                      <div className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl text-center border border-red-100">Alpa / Tidak Hadir</div>
                    ) : (
                      <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl text-center border border-gray-100">Akan Datang</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
