"use client";

import React, { useState } from "react";
import { CalendarCheck, MapPin, Video, CheckCircle2, AlertCircle, RefreshCw, LogOut, Clock } from "lucide-react";
import { studentCheckIn, studentCheckOut } from "@/app/actions/absensi";
import { useRouter } from "next/navigation";

export default function SiswaAbsensiClient({ history, classes }: { history: any[], classes: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check today's attendances
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysAttendances = history.filter(h => {
    const hDate = new Date(h.date);
    hDate.setHours(0, 0, 0, 0);
    return hDate.getTime() === today.getTime();
  });

  const getAttendanceForClass = (classId: string) => {
    return todaysAttendances.find(h => h.class_id === classId);
  };

  const handleCheckIn = async (classId: string) => {
    setLoadingId(`checkin-${classId}`);
    setError(null);
    try {
      const res = await studentCheckIn(classId);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memproses Check-In.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCheckOut = async (attendanceId: string, classId: string) => {
    setLoadingId(`checkout-${classId}`);
    setError(null);
    try {
      const res = await studentCheckOut(attendanceId);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memproses Check-Out.");
    } finally {
      setLoadingId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getDurationString = (checkInStr: string, checkOutStr: string) => {
    if (!checkInStr || !checkOutStr) return "-";
    const start = new Date(checkInStr).getTime();
    const end = new Date(checkOutStr).getTime();
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} Menit`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-teal-50 rounded-xl shrink-0">
            <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Sesi Kelas Hari Ini</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 shadow-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* Class Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.length > 0 ? (
          classes.map((cls) => {
            const att = getAttendanceForClass(cls.id);
            const isCheckedIn = !!att;
            const isCheckedOut = isCheckedIn && !!att.check_out_time;
            const isLoadingCheckIn = loadingId === `checkin-${cls.id}`;
            const isLoadingCheckOut = loadingId === `checkout-${cls.id}`;

            return (
              <div key={cls.id} className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col justify-between transition-all duration-300 ${
                isCheckedIn && !isCheckedOut ? 'border-namsan-primary shadow-md relative overflow-hidden' : 'border-gray-100'
              }`}>
                {/* Active Session Indicator */}
                {isCheckedIn && !isCheckedOut && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-namsan-primary via-yellow-400 to-namsan-primary animate-pulse" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.type === 'ONLINE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {cls.type === 'ONLINE' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                    </div>
                    {isCheckedOut ? (
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    ) : isCheckedIn ? (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Sedang Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        Belum Hadir
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-namsan-text mb-1">{cls.name}</h2>
                  <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    {cls.type === 'ONLINE' ? 'Kelas Daring (Online)' : 'Kelas Tatap Muka (Offline)'}
                  </p>
                </div>

                <div className="mt-auto">
                  {isCheckedOut ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-500 font-medium">Jam Masuk</span>
                        <span className="font-bold text-namsan-text">{formatTime(att.check_in_time)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-gray-500 font-medium">Jam Keluar</span>
                        <span className="font-bold text-namsan-text">{formatTime(att.check_out_time)}</span>
                      </div>
                    </div>
                  ) : isCheckedIn ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50 flex items-center justify-between text-sm">
                        <span className="text-blue-800 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" /> Jam Masuk:
                        </span>
                        <span className="font-bold text-blue-900">{formatTime(att.check_in_time)}</span>
                      </div>
                      <button 
                        onClick={() => handleCheckOut(att.id, cls.id)}
                        disabled={isLoadingCheckOut}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm border border-red-200 hover:border-red-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        {isLoadingCheckOut ? <RefreshCw className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                        Selesaikan Sesi (Check-Out)
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCheckIn(cls.id)}
                      disabled={isLoadingCheckIn}
                      className="w-full bg-gradient-to-r from-namsan-primary to-[#ffcf6b] hover:from-[#ffcf6b] hover:to-[#ffb732] text-namsan-dark font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 text-sm"
                    >
                      {isLoadingCheckIn ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CalendarCheck className="w-5 h-5" />}
                      Mulai Sesi (Check-In)
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <h2 className="text-lg font-bold text-namsan-text mb-2">Belum Memiliki Kelas</h2>
            <p className="text-sm text-gray-500">Anda belum terdaftar di kelas manapun, sehingga tidak dapat melakukan absensi.</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base md:text-lg font-bold text-namsan-text mb-3 md:mb-4">Riwayat Kehadiran Keseluruhan</h3>
        
        {history.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Tanggal</th>
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Kelas</th>
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Check-In</th>
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Check-Out</th>
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Durasi</th>
                      <th className="py-3 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((h: any) => (
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-namsan-text text-sm whitespace-nowrap">{new Date(h.date).toLocaleDateString('id-ID')}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm whitespace-nowrap">{h.class.name}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm text-center font-medium">{formatTime(h.check_in_time)}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm text-center font-medium">{formatTime(h.check_out_time)}</td>
                        <td className="py-4 px-4 text-namsan-text text-sm text-center font-bold">
                          {getDurationString(h.check_in_time, h.check_out_time)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {h.status === 'PRESENT' && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hadir</span>}
                          {h.status === 'LATE' && <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Terlambat</span>}
                          {h.status === 'ABSENT' && <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Alpa</span>}
                          {h.status === 'EXCUSED' && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Izin</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500 text-sm">
            Belum ada riwayat kehadiran.
          </div>
        )}
      </div>

    </div>
  );
}
