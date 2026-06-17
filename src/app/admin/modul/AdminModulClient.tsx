"use client";

import React, { useState } from "react";
import { BookOpen, Trash2, Plus, FileText, Headphones } from "lucide-react";
import { createAdminModule, deleteAdminModule } from "@/app/actions/admin";
import { KoreanInput } from "@/components/KoreanInput";

export default function AdminModulClient({ initialModules, classes }: { initialModules: any[], classes: any[] }) {
  const [modules, setModules] = useState(initialModules);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus modul ini secara permanen?")) return;
    const res = await deleteAdminModule(id);
    if (res.success) {
      setModules(modules.filter((m) => m.id !== id));
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createAdminModule(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-namsan-red-light rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Manajemen Modul Global</h1>
            <p className="text-sm text-namsan-text-muted">Admin dapat mengelola semua modul untuk semua kelas.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Tambah Modul</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Tambah Modul Baru</h2>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Modul</label>
              <KoreanInput type="text" name="title" required placeholder="Contoh: Modul 1: Hangeul Dasar" className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Dokumen (PDF) *opsional</label>
              <input type="url" name="pdf_url" placeholder="https://..." className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Audio (Listening) *opsional</label>
              <input type="url" name="audio_url" placeholder="https://..." className="w-full p-2.5 border rounded-lg" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button type="submit" className="w-full bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3 px-4 rounded-lg">
                Simpan & Publikasi Modul
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm">
              <th className="p-4 font-bold text-namsan-text-muted">Judul Modul</th>
              <th className="p-4 font-bold text-namsan-text-muted">Kelas</th>
              <th className="p-4 font-bold text-namsan-text-muted text-center">Lampiran</th>
              <th className="p-4 font-bold text-namsan-text-muted text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-namsan-text">{m.title}</td>
                <td className="p-4 text-gray-500">{m.class.name}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    {m.pdf_url ? (
                      <a href={m.pdf_url} target="_blank" rel="noreferrer" className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Buka PDF">
                        <FileText className="w-5 h-5" />
                      </a>
                    ) : <span className="w-5 h-5 opacity-20"><FileText className="w-5 h-5" /></span>}
                    
                    {m.audio_url ? (
                      <a href={m.audio_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-1.5 rounded" title="Putar Audio">
                        <Headphones className="w-5 h-5" />
                      </a>
                    ) : <span className="w-5 h-5 opacity-20"><Headphones className="w-5 h-5" /></span>}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors title='Hapus Modul'">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada modul yang diunggah.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
