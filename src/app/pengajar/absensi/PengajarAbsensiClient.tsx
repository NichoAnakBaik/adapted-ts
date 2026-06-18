"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Search, Users, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { getClassAttendanceForTeacher } from "@/app/actions/absensi";

export default function PengajarAbsensiClient({ classes }: { classes: any[] }) {
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].id : "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await getClassAttendanceForTeacher(selectedClass, selectedDate);
      setAttendanceList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-teal-50 rounded-xl shrink-0">
            <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Pantauan Absensi</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Lihat laporan kehadiran harian siswa di kelas Anda.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs md:text-sm font-bold text-gray-600 mb-1 md:mb-2">Pilih Kelas</label>
          <div className="relative">
            <Users className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-1 focus:ring-namsan-primary outline-none appearance-none font-medium text-sm md:text-base"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {classes.length === 0 && <option value="">Tidak ada kelas</option>}
            </select>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs md:text-sm font-bold text-gray-600 mb-1 md:mb-2">Pilih Tanggal</label>
          <div className="relative">
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-1 focus:ring-namsan-primary outline-none font-medium text-gray-600 text-sm md:text-base"
            />
          </div>
        </div>

        <button 
          onClick={loadAttendance}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 md:p-3 rounded-xl transition-colors sm:w-auto w-full flex justify-center mt-2 sm:mt-0"
          title="Muat Ulang"
        >
          <RefreshCw className={`w-5 h-5 md:w-6 md:h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-bold text-namsan-text">Daftar Kehadiran</h2>
          <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold w-full sm:w-auto text-center">
            Total Hadir: {attendanceList.filter(a => a.status === 'PRESENT').length} Siswa
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : attendanceList.length > 0 ? (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Nama Siswa</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Check-In</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Check-Out</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap text-center">Durasi Sesi</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Status</th>
                      <th className="py-3 md:py-4 px-4 text-[10px] md:text-xs font-bold text-namsan-text-muted tracking-wider uppercase whitespace-nowrap">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceList.map((a: any) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 md:py-4 px-4 whitespace-nowrap">
                          <p className="font-bold text-sm md:text-base text-namsan-text">{a.student.nama_lengkap}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">@{a.student.username}</p>
                        </td>
                        <td className="py-3 md:py-4 px-4 font-medium text-xs md:text-sm text-gray-600 whitespace-nowrap text-center">
                          {a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date(a.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 md:py-4 px-4 font-medium text-xs md:text-sm text-gray-600 whitespace-nowrap text-center">
                          {a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-3 md:py-4 px-4 font-bold text-xs md:text-sm text-namsan-text whitespace-nowrap text-center">
                          {a.check_in_time && a.check_out_time ? `${Math.round((new Date(a.check_out_time).getTime() - new Date(a.check_in_time).getTime()) / 60000)} Menit` : '-'}
                        </td>
                        <td className="py-3 md:py-4 px-4 whitespace-nowrap">
                          {a.status === 'PRESENT' && <span className="bg-green-50 text-green-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Hadir</span>}
                          {a.status === 'LATE' && <span className="bg-orange-50 text-orange-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Terlambat</span>}
                          {a.status === 'ABSENT' && <span className="bg-red-50 text-red-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Alpa</span>}
                          {a.status === 'EXCUSED' && <span className="bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold">Izin</span>}
                        </td>
                        <td className="py-3 md:py-4 px-4 text-gray-500 text-xs md:text-sm min-w-[150px]">{a.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 md:py-12 text-center border-2 border-dashed border-gray-100 rounded-xl mx-4 md:mx-0">
            <CalendarCheck className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
            <p className="text-sm md:text-base text-gray-500 font-medium">Belum ada data kehadiran pada tanggal ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}
