"use client";

import React, { useState } from "react";
import { PenTool, Plus, Trash2, ArrowRight, Clock, FileQuestion } from "lucide-react";
import Link from "next/link";
import { createAdminExam, deleteAdminExam, toggleAdminExamPublish } from "@/app/actions/admin";

export default function AdminUjianClient({ initialExams, classes }: { initialExams: any[], classes: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createAdminExam(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ujian akhir ini secara permanen?")) return;
    const res = await deleteAdminExam(id);
    if (res.success) {
      setExams(exams.filter(e => e.id !== id));
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Tarik kembali (unpublish) ujian ini?" : "Publikasikan ujian ini sekarang?")) return;
    const res = await toggleAdminExamPublish(id, !currentStatus);
    if (res.success) {
      setExams(exams.map(e => e.id === id ? { ...e, is_published: !currentStatus } : e));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <PenTool className="w-8 h-8 text-namsan-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Manajemen Ujian Bahasa</h1>
            <p className="text-sm text-namsan-text-muted">Buat dan kelola Ujian Akhir (Final Exam) khusus dengan 4 format soal bahasa.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-namsan-red hover:bg-namsan-red/90 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Buat Ujian Baru</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Form Buat Ujian Baru</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                <select name="class_id" required className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="">-- Pilih Kelas untuk Ujian Ini --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Ujian</label>
                <input type="text" name="title" required placeholder="Contoh: Ujian Akhir Level 1" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Menit)</label>
                <input type="number" name="time_limit" placeholder="Kosongkan jika tidak ada batas" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Instruksi Tambahan</label>
                <textarea name="description" rows={3} placeholder="Instruksi pengerjaan ujian..." className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  Simpan Ujian (Buka untuk Menambah Soal)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari judul ujian atau nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div key={exam.id} className={`bg-white rounded-2xl shadow-sm border ${exam.is_published ? 'border-namsan-primary' : 'border-gray-200'} overflow-hidden flex flex-col transition-all hover:shadow-md`}>
            <div className="p-5 border-b border-gray-50 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-namsan-red">
                  Ujian Akhir
                </span>
                <button 
                  onClick={() => handleTogglePublish(exam.id, exam.is_published)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${exam.is_published ? 'bg-namsan-primary text-namsan-dark hover:bg-yellow-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {exam.is_published ? '✓ Terpublikasi' : 'Draft'}
                </button>
              </div>
              <h3 className="text-lg font-bold text-namsan-text mb-1 line-clamp-1">{exam.title}</h3>
              <p className="text-sm font-semibold text-namsan-primary mb-3">Kelas: {exam.class.name}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm mt-auto">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{exam.time_limit ? `${exam.time_limit} Menit` : 'Tanpa Batas'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <FileQuestion className="w-4 h-4 text-namsan-red" />
                  <span className="font-medium">{exam._count.questions} Soal</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 border-t border-gray-100 flex gap-2">
              <Link href={`/admin/ujian/${exam.id}`} className="flex-1 flex justify-center items-center gap-2 bg-white border border-gray-200 hover:border-namsan-primary text-namsan-text font-bold py-2 rounded-xl transition-colors">
                Kelola Soal <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => handleDelete(exam.id)} className="px-3 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {filteredExams.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
            <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum Ada Ujian</h3>
            <p className="text-gray-500">Klik "Buat Ujian Baru" untuk memulai merancang ujian bahasa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
