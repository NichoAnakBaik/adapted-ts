"use client";

import React, { useState } from "react";
import { Award, Plus, Trash2, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { createOrUpdateCertificate, deleteCertificate } from "@/app/actions/admin";

export default function AdminSertifikatClient({ initialCertificates, students, classes }: { initialCertificates: any[], students: any[], classes: any[] }) {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus sertifikat ini?")) return;
    const res = await deleteCertificate(id);
    if (res.success) {
      setCertificates(certificates.filter((c) => c.id !== id));
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createOrUpdateCertificate(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      window.location.reload();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("status", newStatus);
    const res = await createOrUpdateCertificate(formData);
    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Penerbitan Sertifikat</h1>
            <p className="text-sm text-namsan-text-muted">Kelola dan terbitkan sertifikat kelulusan bagi siswa.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Buat Sertifikat</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Terbitkan Sertifikat Baru</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa</label>
                <select name="student_id" required className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap} (@{s.username})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                <select name="class_id" required className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="">-- Pilih Kelas Lulus --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link File Sertifikat (PDF/Image URL)</label>
                <input type="url" name="file_url" required placeholder="https://drive.google.com/..." className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Awal</label>
                <select name="status" required className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="APPROVED">APPROVED (Selesai & Lulus)</option>
                  <option value="PENDING">PENDING (Menunggu Validasi)</option>
                  <option value="REJECTED">REJECTED (Tidak Lulus/Revisi)</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  Simpan & Terbitkan Sertifikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm">
              <th className="p-4 font-bold text-namsan-text-muted">Nama Siswa</th>
              <th className="p-4 font-bold text-namsan-text-muted">Kelas</th>
              <th className="p-4 font-bold text-namsan-text-muted">Status</th>
              <th className="p-4 font-bold text-namsan-text-muted">Sertifikat</th>
              <th className="p-4 font-bold text-namsan-text-muted text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => (
              <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-namsan-text">
                  {cert.student.nama_lengkap}
                  <div className="text-xs text-gray-400 font-normal">@{cert.student.username}</div>
                </td>
                <td className="p-4 text-gray-600 font-medium">{cert.class.name}</td>
                <td className="p-4">
                  <select 
                    value={cert.status}
                    onChange={(e) => handleUpdateStatus(cert.id, e.target.value)}
                    className={`p-1.5 border rounded-md text-xs font-bold ${
                      cert.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                      cert.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-orange-100 text-orange-700 border-orange-200'
                    }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>
                <td className="p-4">
                  <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-500 hover:underline flex items-center gap-1">
                    Buka File <ArrowRight className="w-3 h-3" />
                  </a>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(cert.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors title='Hapus'">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada sertifikat yang diterbitkan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
