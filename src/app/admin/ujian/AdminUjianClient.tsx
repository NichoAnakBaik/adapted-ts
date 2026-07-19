"use client";

import React, { useState } from "react";
import { ArrowLeft, PenTool, Plus, Trash2, ArrowRight, Clock, FileQuestion } from "lucide-react";
import Link from "next/link";
import { createAdminExam, deleteAdminExam, toggleAdminExamPublish } from "@/app/actions/admin";

export default function AdminUjianClient({ initialExams, classes, className, classId }: { initialExams: any[], classes: any[], className?: string, classId?: string }) {
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
    if (classId) formData.set("class_id", classId); // Force class_id if in class view
    const res = await createAdminExam(formData);
    if (res.error) {
      setError(res.error);
    } else if (res.exam) {
      setExams([res.exam, ...exams]);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ujian ini beserta seluruh pertanyaannya?")) return;
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <PenTool className="w-8 h-8 text-namsan-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Manajemen Ujian Bahasa {className ? `- Kelas ${className}` : ''}</h1>
            <p className="text-sm text-namsan-text-muted">Buat dan kelola Ujian Akhir (Final Exam) khusus dengan 4 format soal bahasa.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {classId && (
            <Link href="/admin/ujian" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors">
              Kembali
            </Link>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-namsan-primary hover:bg-namsan-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Buat Ujian Baru
          </button>
        </div>
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
          <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {exam.class.name}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 group-hover:text-namsan-primary transition-colors">{exam.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
              {exam.description || "Tidak ada deskripsi"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SOAL</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <FileQuestion className="w-4 h-4 text-blue-500" />
                  {exam._count?.questions || 0} Soal
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">WAKTU</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {exam.time_limit ? `${exam.time_limit} Menit` : 'Tanpa Batas'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleTogglePublish(exam.id, exam.is_published)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  exam.is_published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {exam.is_published ? "🟢 PUBLISHED" : "⚫ DRAFT"}
              </button>

              <Link href={`/admin/ujian/${exam.id}`} className="text-sm font-bold text-namsan-primary hover:text-namsan-secondary flex items-center gap-1">
                Kelola Soal <ArrowRight className="w-4 h-4" />
              </Link>
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
