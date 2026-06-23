"use client";

import React, { useState } from "react";
import { ClipboardList, Plus, Clock, FileQuestion, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createExam, toggleExamPublish } from "@/app/actions/pengajar";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";

export default function PengajarKuisClient({ initialExams, classes }: { initialExams: any[], classes: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExams = exams.filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createExam(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      window.location.reload();
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const res = await toggleExamPublish(id, !currentStatus);
    if (res.success) {
      setExams(exams.map(ex => ex.id === id ? { ...ex, is_published: !currentStatus } : ex));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Manajemen Kuis Kelas</h1>
            <p className="text-sm text-namsan-text-muted">Buat dan pantau kuis khusus untuk kelas yang Anda ampu.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-namsan-primary hover:bg-namsan-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Buat Kuis Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Buat Kuis Baru</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                <select name="class_id" required className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kuis</label>
                <KoreanInput type="text" name="title" required placeholder="Contoh: Kuis Hangeul 1" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Menit)</label>
                <input type="number" name="time_limit" placeholder="Kosongkan jika tidak ada batas" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Instruksi</label>
                <KoreanTextarea name="description" rows={3} placeholder="Instruksi pengerjaan ujian..." className="w-full p-2.5 border rounded-lg" />
              </div>
                <input type="hidden" name="is_final" value="false" />
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  Simpan Kuis (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari judul kuis atau nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((ex) => (
          <div key={ex.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {ex.class.name}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 group-hover:text-namsan-primary transition-colors">{ex.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
              {ex.description || "Tidak ada deskripsi"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SOAL</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <FileQuestion className="w-4 h-4 text-blue-500" />
                  {ex._count.questions} Soal
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">WAKTU</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {ex.time_limit ? `${ex.time_limit} Menit` : 'Tanpa Batas'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button 
                onClick={() => handleTogglePublish(ex.id, ex.is_published)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  ex.is_published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ex.is_published ? "🟢 PUBLISHED" : "⚫ DRAFT"}
              </button>

              <Link href={`/pengajar/kuis/${ex.id}`} className="text-sm font-bold text-namsan-primary hover:text-namsan-secondary flex items-center gap-1">
                Kelola Soal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {filteredExams.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Kuis</h3>
            <p className="text-gray-500 mt-2">Anda belum membuat kuis atau ujian untuk kelas Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
