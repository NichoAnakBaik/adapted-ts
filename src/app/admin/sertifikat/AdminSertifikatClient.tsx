"use client";

import React, { useState } from "react";
import { Award, Plus, Trash2, Pencil, CheckCircle2, XCircle, Clock, ArrowRight, Download } from "lucide-react";
import { createOrUpdateCertificate, deleteCertificate } from "@/app/actions/admin";

export default function AdminSertifikatClient({ initialCertificates, students, classes }: { initialCertificates: any[], students: any[], classes: any[] }) {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCertificates = certificates.filter(c => 
    c.student.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      closeForm();
      window.location.reload();
    }
  };

  const openEditForm = (cert: any) => {
    setEditingCert(cert);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCert(null);
    setError("");
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
          onClick={() => showForm ? closeForm() : setShowForm(true)}
          className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Buat Sertifikat</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">{editingCert ? "Edit Sertifikat" : "Terbitkan Sertifikat Baru"}</h2>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingCert && <input type="hidden" name="id" value={editingCert.id} />}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa</label>
                <select name="student_id" required className="w-full p-2.5 border rounded-lg bg-white" defaultValue={editingCert?.student_id || ""}>
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap} (@{s.username})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
                <select name="class_id" required className="w-full p-2.5 border rounded-lg bg-white" defaultValue={editingCert?.class_id || ""}>
                  <option value="">-- Pilih Kelas Lulus --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File Sertifikat (PDF/Image) {editingCert ? "(Opsional jika tidak diubah)" : ""}</label>
                <input type="file" accept="application/pdf,image/*" name="file_url" required={!editingCert} className="w-full p-2.5 border rounded-lg bg-white" />
                {editingCert?.file_url && <p className="text-xs text-blue-600 mt-2">File sertifikat saat ini sudah ada. Upload baru untuk mengganti.</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Awal</label>
                <select name="status" required className="w-full p-2.5 border rounded-lg bg-white" defaultValue={editingCert?.status || "APPROVED"}>
                  <option value="APPROVED">APPROVED (Selesai & Lulus)</option>
                  <option value="PENDING">PENDING (Menunggu Validasi)</option>
                  <option value="REJECTED">REJECTED (Tidak Lulus/Revisi)</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  {editingCert ? "Simpan Perubahan" : "Simpan & Terbitkan Sertifikat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <input 
          type="text" 
          placeholder="Cari nama siswa atau kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCertificates.map((cert) => (
          <div key={cert.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-namsan-primary hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold ${
                cert.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                cert.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {cert.status}
              </span>
              <select 
                value={cert.status}
                onChange={(e) => handleUpdateStatus(cert.id, e.target.value)}
                className="p-1 border rounded bg-gray-50 text-[10px] md:text-xs font-medium text-gray-600 outline-none hover:bg-gray-100 cursor-pointer"
                title="Ubah Status"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                {cert.student.nama_lengkap.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <h3 className="font-bold text-base md:text-lg text-namsan-text truncate">{cert.student.nama_lengkap}</h3>
                <p className="text-xs text-gray-500 truncate">@{cert.student.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 flex-1 mb-4">
              <div className="flex items-start gap-2 text-xs md:text-sm">
                <span className="font-medium text-gray-700 block w-16">Kelas:</span>
                <span className="text-gray-600 line-clamp-2">{cert.class.name}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button onClick={() => openEditForm(cert)} className="p-2 md:p-2.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center title='Edit'">
                  <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={() => handleDelete(cert.id)} className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center title='Hapus'">
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              
              {cert.file_url ? (
                <a href={cert.file_url} target="_blank" rel="noreferrer" className="bg-namsan-soft hover:bg-namsan-primary text-namsan-dark font-bold py-2 md:py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm md:text-base transition-colors flex-1 justify-center">
                  <Download className="w-4 h-4 md:w-5 md:h-5" /> Lihat Dokumen
                </a>
              ) : (
                <span className="text-sm text-gray-400 italic text-center flex-1">Belum diunggah</span>
              )}
            </div>
          </div>
        ))}
        {filteredCertificates.length === 0 && (
          <div className="col-span-full p-8 md:p-12 text-center text-gray-500 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            Belum ada pengajuan sertifikat.
          </div>
        )}
      </div>
    </div>
  );
}
