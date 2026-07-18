"use client";

import React, { useState } from "react";
import { BookOpen, Trash2, Plus, Users, UserPlus, ArrowRight, Link as LinkIcon, Calendar } from "lucide-react";
import { createClass, deleteClass } from "@/app/actions/admin";
import { KoreanInput } from "@/components/KoreanInput";
import Link from "next/link";

export default function ClassManagementClient({ initialClasses, teachers, students }: { initialClasses: any[], teachers: any[], students: any[] }) {
  const [classes, setClasses] = useState(initialClasses);
  const [showForm, setShowForm] = useState(false);
  const [classType, setClassType] = useState("ONLINE");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kelas ini? Semua data terkait modul dan nilai akan terhapus!")) return;
    const res = await deleteClass(id);
    if (res.success) {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createClass(formData);
    
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
          <div className="p-3 bg-blue-50 rounded-xl">
            <BookOpen className="w-8 h-8 text-namsan-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Manajemen Kelas</h1>
            <p className="text-sm text-namsan-text-muted">Kelola kelas, tipe pembelajaran, dan pengajar.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Buat Kelas Baru</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Buat Kelas Baru</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kelas</label>
                <KoreanInput type="text" name="name" required placeholder="Contoh: Level 1 - Beginner A" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Kelas</label>
                <input type="number" name="level" min="1" max="12" defaultValue="1" required className="w-full p-2.5 border rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembelajaran</label>
                <select name="type" required value={classType} onChange={(e) => setClassType(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="ONLINE">Online (Daring)</option>
                  <option value="OFFLINE">Offline (Tatap Muka)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Link GDrive Modul (Wajib)</label>
                <input type="url" name="module_link" required placeholder="https://drive.google.com/..." className="w-full p-2.5 border rounded-lg" />
              </div>

              {classType === "ONLINE" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Meeting (Opsional)</label>
                  <input type="url" name="meeting_link" placeholder="https://zoom.us/j/..." className="w-full p-2.5 border rounded-lg" />
                  <p className="text-xs text-gray-500 mt-1">Pengajar dapat menambahkan link ini nanti jika dikosongkan.</p>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Kelas (Opsional)</label>
                <input type="text" name="schedule" placeholder="Contoh: Senin & Rabu, 18:00 - 20:00" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <input 
          type="text" 
          placeholder="Cari nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredClasses.map((c) => (
          <div key={c.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-namsan-primary hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold ${
                c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {c.type}
              </span>
              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm font-medium bg-gray-50 px-2 py-1 rounded-lg">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                {c._count?.enrollments || 0} Siswa
              </div>
            </div>
            
            <h3 className="font-bold text-lg md:text-xl text-namsan-text group-hover:text-namsan-primary transition-colors line-clamp-2">{c.name}</h3>
            
            <div className="mt-3 md:mt-4 space-y-2 flex-1">
              <div className="flex items-start gap-2 text-xs md:text-sm">
                <div className="w-5 md:w-6 flex justify-center shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                </div>
                <div className="text-gray-500 line-clamp-2">
                  <span className="font-medium text-gray-700 block">Pengajar:</span>
                  {c.teacher?.nama_lengkap ? c.teacher.nama_lengkap : <span className="italic">Belum ada pengajar</span>}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
              <button onClick={() => handleDelete(c.id)} className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center title='Hapus Kelas'">
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <Link href={`/admin/kelas/${c.id}`} className="bg-namsan-soft hover:bg-namsan-primary text-namsan-dark font-bold py-2 md:py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm md:text-base transition-colors flex-1 justify-center">
                Kelola Kelas <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </div>
        ))}
        {filteredClasses.length === 0 && (
          <div className="col-span-full p-8 md:p-12 text-center text-gray-500 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            Belum ada kelas yang dibuat.
          </div>
        )}
      </div>
    </div>
  );
}
