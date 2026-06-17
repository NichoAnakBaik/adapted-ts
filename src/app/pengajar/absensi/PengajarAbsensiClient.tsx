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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-xl">
            <CalendarCheck className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pantauan Absensi</h1>
            <p className="text-sm text-namsan-text-muted">Lihat laporan kehadiran harian siswa di kelas Anda.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-2">Pilih Kelas</label>
          <div className="relative">
            <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-1 focus:ring-namsan-primary outline-none appearance-none font-medium"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {classes.length === 0 && <option value="">Tidak ada kelas</option>}
            </select>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-600 mb-2">Pilih Tanggal</label>
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-namsan-primary focus:ring-1 focus:ring-namsan-primary outline-none font-medium text-gray-600"
            />
          </div>
        </div>

        <button 
          onClick={loadAttendance}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors sm:w-auto w-full flex justify-center"
          title="Muat Ulang"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-namsan-text">Daftar Kehadiran</h2>
          <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">
            Total Hadir: {attendanceList.filter(a => a.status === 'PRESENT').length} Siswa
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : attendanceList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase">Nama Siswa</th>
                  <th className="py-4 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase">Waktu Check-In</th>
                  <th className="py-4 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase">Status</th>
                  <th className="py-4 px-4 text-xs font-bold text-namsan-text-muted tracking-wider uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceList.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-namsan-text">{a.student.nama_lengkap}</p>
                      <p className="text-xs text-gray-500">@{a.student.username}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-600">{new Date(a.date).toLocaleTimeString('id-ID')}</td>
                    <td className="py-4 px-4">
                      {a.status === 'PRESENT' && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hadir</span>}
                      {a.status === 'LATE' && <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Terlambat</span>}
                      {a.status === 'ABSENT' && <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Alpa</span>}
                      {a.status === 'EXCUSED' && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Izin</span>}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">{a.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada data kehadiran pada tanggal ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}
