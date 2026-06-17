"use client";

import React, { useState } from "react";
import { CalendarCheck, MapPin, Video, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { studentCheckIn } from "@/app/actions/absensi";
import { useRouter } from "next/navigation";

export default function SiswaAbsensiClient({ history, activeClass }: { history: any[], activeClass: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if student has already checked in today for their active class
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasCheckedInToday = history.some(h => {
    const hDate = new Date(h.date);
    hDate.setHours(0, 0, 0, 0);
    return hDate.getTime() === today.getTime() && h.class_id === activeClass?.id;
  });

  const handleCheckIn = async () => {
    if (!activeClass) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await studentCheckIn(activeClass.id);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memproses absensi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-teal-50 rounded-xl shrink-0">
            <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Absensi Kelas</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Lakukan presensi kehadiran harian Anda.</p>
          </div>
        </div>
      </div>

      {/* Check-In Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
        {activeClass ? (
          <>
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4 ${activeClass.type === 'ONLINE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
              {activeClass.type === 'ONLINE' ? <Video className="w-6 h-6 md:w-8 md:h-8" /> : <MapPin className="w-6 h-6 md:w-8 md:h-8" />}
            </div>
            
            <h2 className="text-lg md:text-xl font-bold text-namsan-text mb-1">Kelas Aktif: {activeClass.name}</h2>
            <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {error && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 text-red-600 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> {error}
              </div>
            )}

            {hasCheckedInToday ? (
              <div className="bg-green-50 text-green-700 px-4 md:px-8 py-3 md:py-4 rounded-xl flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold border border-green-100">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 shrink-0" /> Anda sudah mengisi daftar hadir hari ini.
              </div>
            ) : (
              <button 
                onClick={handleCheckIn}
                disabled={loading}
                className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 md:py-4 px-6 md:px-12 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base md:text-lg w-full sm:w-auto justify-center"
              >
                {loading ? <RefreshCw className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <CalendarCheck className="w-5 h-5 md:w-6 md:h-6" />}
                Isi Daftar Hadir
              </button>
            )}
          </>
        ) : (
          <div className="py-6 md:py-8">
            <h2 className="text-base md:text-lg font-bold text-namsan-text mb-2">Belum Memiliki Kelas</h2>
            <p className="text-xs md:text-sm text-gray-500">Anda belum terdaftar di kelas manapun, sehingga tidak dapat melakukan absensi.</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base md:text-lg font-bold text-namsan-text mb-3 md:mb-4">Riwayat Kehadiran</h3>
        
        {history.length > 0 ? (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Tanggal</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Kelas</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Status</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((h: any) => (
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 md:py-4 px-4 font-medium text-namsan-text text-xs md:text-sm whitespace-nowrap">{new Date(h.date).toLocaleDateString('id-ID')}</td>
                        <td className="py-3 md:py-4 px-4 text-gray-600 text-xs md:text-sm whitespace-nowrap">{h.class.name}</td>
                        <td className="py-3 md:py-4 px-4 whitespace-nowrap">
                          {h.status === 'PRESENT' && <span className="bg-green-50 text-green-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Hadir</span>}
                          {h.status === 'LATE' && <span className="bg-orange-50 text-orange-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Terlambat</span>}
                          {h.status === 'ABSENT' && <span className="bg-red-50 text-red-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Alpa</span>}
                          {h.status === 'EXCUSED' && <span className="bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Izin</span>}
                        </td>
                        <td className="py-3 md:py-4 px-4 text-gray-500 text-xs md:text-sm min-w-[150px]">{h.notes || '-'}</td>
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
