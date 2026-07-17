"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Users, RefreshCw, Calendar as CalendarIcon, Settings, Edit2, Save, X, Eye, Plus, Trash2 } from "lucide-react";
import { getTeacherAttendanceSessions, generateAttendanceSessions, updateAttendanceSession, getSessionAttendances, createSingleAttendanceSession, deleteAttendanceSession } from "@/app/actions/absensi";

export default function PengajarAbsensiClient({ classes }: { classes: any[] }) {
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].id : "");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Mode state
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", date: "", description: "" });

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
      const data = await getTeacherAttendanceSessions(selectedClass);
      setSessions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleGenerate = async (count: number) => {
    if (!confirm(`Apakah Anda yakin ingin membuat ${count} sesi otomatis?`)) return;
    setLoading(true);
    await generateAttendanceSessions(selectedClass, count);
    await loadSessions();
  };

  const startEdit = (s: any) => {
    setEditingSession(s.id);
    setEditData({
      title: s.title || "",
      date: s.date ? new Date(s.date).toISOString().split('T')[0] : "",
      description: s.description || ""
    });
  };

  const [savingEdit, setSavingEdit] = useState(false);

  const saveEdit = async (s: any) => {
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append("title", editData.title);
      fd.append("date", editData.date);
      fd.append("description", editData.description);
      const res = await updateAttendanceSession(s.id, fd);
      
      setEditingSession(null);
      await loadSessions();

      if (res.quizGenerated) {
        alert("Sesi absensi berhasil diperbarui. 🎉 Kuis latihan harian AI telah otomatis dibuat berdasarkan materi yang Anda masukkan!");
      }
    } catch (e) {
      alert("Gagal menyimpan perubahan");
    }
    setSavingEdit(false);
  };

  const handleCreateSingle = async () => {
    setLoading(true);
    await createSingleAttendanceSession(selectedClass);
    await loadSessions();
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Yakin ingin menghapus sesi absensi ini? Seluruh data kehadiran siswa pada sesi ini juga akan ikut terhapus.")) return;
    setLoading(true);
    await deleteAttendanceSession(sessionId);
    await loadSessions();
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
            <CalendarCheck className="w-6 h-6 text-teal-500" /> Manajemen Sesi Absensi
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola jadwal pertemuan dan lihat absensi siswa per sesi.</p>
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
        <div className="bg-white rounded-2xl p-8 md:p-16 text-center border-2 border-dashed border-gray-200 hover:border-teal-200 transition-colors">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Sesi Pertemuan</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">Kelas ini belum memiliki kerangka sesi absensi. Anda bisa membuat 14 atau 16 sesi secara otomatis lalu mengatur tanggalnya secara spesifik nanti.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => handleGenerate(14)} className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold py-3 px-8 rounded-xl transition-colors">
              Buat 14 Sesi
            </button>
            <button onClick={() => handleGenerate(16)} className="bg-namsan-primary text-white hover:bg-namsan-primary/90 font-bold py-3 px-8 rounded-xl transition-colors shadow-sm">
              Buat 16 Sesi
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-namsan-text flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" /> Daftar Sesi Kelas ({sessions.length} Sesi)
            </h2>
            <button 
              onClick={handleCreateSingle}
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Sesi
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {sessions.map((s, idx) => (
              <div key={s.id} className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row justify-between gap-4">
                {editingSession === s.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Judul Sesi</label>
                      <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full p-2.5 border border-gray-200 focus:border-namsan-primary rounded-lg text-sm bg-white outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Tanggal Pelaksanaan</label>
                      <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full p-2.5 border border-gray-200 focus:border-namsan-primary rounded-lg text-sm bg-white outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Deskripsi / Materi</label>
                      <input type="text" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Topik pembahasan..." className="w-full p-2.5 border border-gray-200 focus:border-namsan-primary rounded-lg text-sm bg-white outline-none" />
                    </div>
                  </div>
                ) : (
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
                )}
                
                <div className="flex items-center gap-2 md:pl-4 md:border-l border-gray-100">
                  {editingSession === s.id ? (
                    <>
                      <button disabled={savingEdit} onClick={() => saveEdit(s)} className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50" title="Simpan Perubahan">
                        {savingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button disabled={savingEdit} onClick={() => setEditingSession(null)} className="p-2.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50" title="Batal">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(s)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Detail Sesi">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => loadAttendancesForSession(s)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-namsan-text font-bold text-xs rounded-lg hover:border-namsan-primary hover:text-namsan-primary transition-colors">
                        <Eye className="w-4 h-4" /> Cek Kehadiran ({s._count?.attendances || 0})
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Sesi">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
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
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10">
                    <tr>
                      <th className="p-4 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Nama Siswa</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-[10px] tracking-wider text-center">Waktu Absen</th>
                      <th className="p-4 font-bold text-gray-500 uppercase text-[10px] tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendances.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{a.student.nama_lengkap}</div>
                          <div className="text-xs text-gray-400">@{a.student.username}</div>
                        </td>
                        <td className="p-4 text-gray-600 text-center font-medium">
                          {new Date(a.check_in_time).toLocaleTimeString('id-ID', { timeStyle: 'short' })}
                        </td>
                        <td className="p-4">
                          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-100">Hadir</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
