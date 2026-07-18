"use client";

import React, { useState } from "react";
import { FileQuestion, ArrowLeft, Plus, Trash2, Pencil, Headphones, BookOpen, PenTool, MessageCircle, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createAdminQuestion, updateAdminQuestion, deleteAdminQuestion, assignExamToStudent, assignAllEligibleStudents } from "@/app/actions/admin";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";
import SiswaHasilClient from "@/app/siswa/kuis/[id]/hasil/SiswaHasilClient";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AdminUjianDetailClient({ exam, initialEligibleStudents }: { exam: any, initialEligibleStudents: any[] }) {
  const [questions, setQuestions] = useState(exam.questions);
  const [activeTab, setActiveTab] = useState<"SPEAKING" | "LISTENING" | "READING" | "WRITING">("READING");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [error, setError] = useState("");
  const [questionFormat, setQuestionFormat] = useState("MULTIPLE_CHOICE");
  const [viewMode, setViewMode] = useState<"SOAL" | "HASIL" | "ELIGIBILITY" | "HASIL_DETAIL">("SOAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  
  const [eligibleStudents, setEligibleStudents] = useState(initialEligibleStudents);
  const [assigningAll, setAssigningAll] = useState(false);

  const tabs = [
    { id: "READING", label: "Membaca (Reading)", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "WRITING", label: "Menulis (Writing)", icon: PenTool, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "LISTENING", label: "Mendengar (Listening)", icon: Headphones, color: "text-green-500", bg: "bg-green-50" },
    { id: "SPEAKING", label: "Berbicara (Speaking)", icon: MessageCircle, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const filteredQuestions = questions.filter((q: any) => q.type === activeTab);

  const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("exam_id", exam.id);
    formData.append("type", activeTab);

    try {
      // Let Next.js handle the File uploads natively via multipart/form-data
      // No need to convert to base64, which bloats the payload and crashes

      let res;
      if (editingQuestion) {
        formData.append("id", editingQuestion.id);
        res = await updateAdminQuestion(formData);
      } else {
        res = await createAdminQuestion(formData);
      }
      
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || "Terjadi kesalahan");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan soal. Pastikan file tidak terlalu besar (maks 50MB).");
    }
  };

  const openEditForm = (q: any) => {
    setEditingQuestion(q);
    setQuestionFormat(q.format || "ESSAY");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setQuestionFormat("MULTIPLE_CHOICE");
    setError("");
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return;
    const res = await deleteAdminQuestion(id);
    if (res.success) {
      setQuestions(questions.filter((q: any) => q.id !== id));
    }
  };

  const handleAssignSingle = async (studentId: string) => {
    const res = await assignExamToStudent(exam.id, studentId);
    if (res.success) {
      setEligibleStudents(prev => prev.map(s => s.student.id === studentId ? { ...s, isAssigned: true } : s));
    } else {
      alert(res.error || "Gagal meng-assign ujian.");
    }
  };

  const handleAssignAllEligible = async () => {
    if (!confirm("Assign semua siswa yang memenuhi persentase kehadiran (>= 75%)?")) return;
    setAssigningAll(true);
    const res = await assignAllEligibleStudents(exam.id);
    if (res.success) {
      alert(`Berhasil meng-assign ${res.count} siswa.`);
      setEligibleStudents(prev => prev.map(s => s.attendanceRate >= 75 ? { ...s, isAssigned: true } : s));
    } else {
      alert(res.error || "Gagal meng-assign ujian.");
    }
    setAssigningAll(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Link href="/admin/ujian" className="inline-flex items-center gap-2 text-gray-500 hover:text-namsan-primary font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Ujian
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-namsan-primary/10 text-namsan-primary mb-3">
            Kelas: {exam.class.name}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h1>
          <p className="text-gray-500 text-sm max-w-2xl">{exam.description || "Tidak ada deskripsi ujian."}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Total Soal Keseluruhan</div>
          <div className="text-3xl font-black text-namsan-primary">{questions.length}</div>
        </div>
      </div>

      <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 w-fit">
        <button
          onClick={() => setViewMode("SOAL")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            viewMode === "SOAL" ? "bg-namsan-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Manajemen Soal
        </button>
        <button
          onClick={() => setViewMode("ELIGIBILITY")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            viewMode === "ELIGIBILITY" ? "bg-namsan-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Persetujuan Siswa
        </button>
        <button
          onClick={() => { setViewMode("HASIL"); setSelectedAttempt(null); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            viewMode === "HASIL" || viewMode === "HASIL_DETAIL" ? "bg-namsan-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" /> Hasil Siswa
        </button>
      </div>

      {viewMode === "SOAL" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = questions.filter((q: any) => q.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setShowForm(false); setError(""); }}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 px-4 font-bold text-sm transition-all border-b-2 ${
                  isActive ? `border-${tab.color.split('-')[1]}-500 ${tab.color} bg-gray-50` : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? '' : 'opacity-50'}`} />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? tab.bg : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 bg-gray-50/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Soal {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={() => showForm ? closeForm() : setShowForm(true)}
              className="bg-white border-2 border-namsan-primary text-namsan-dark hover:bg-namsan-primary font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              {showForm ? "Batal Tambah" : <><Plus className="w-5 h-5" /> Tambah Soal</>}
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-blue-100">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingQuestion ? `Edit Soal ${tabs.find(t => t.id === activeTab)?.label}` : `Buat Soal ${tabs.find(t => t.id === activeTab)?.label} Baru`}
                  </h3>
                  <button type="button" onClick={closeForm} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
                
                <form onSubmit={handleCreateQuestion} encType="multipart/form-data" className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Teks Soal / Pertanyaan</label>
                    <KoreanTextarea name="question_text" defaultValue={editingQuestion?.question_text || ""} required rows={3} placeholder="Masukkan soal dalam bahasa Indonesia atau Korea..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Format Soal</label>
                      <select name="format" value={questionFormat} onChange={(e) => setQuestionFormat(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="MULTIPLE_CHOICE">Pilihan Ganda (A/B/C/D)</option>
                        <option value="ESSAY">Isian (Esai / Text Panjang)</option>
                      </select>
                    </div>

                    {questionFormat === "MULTIPLE_CHOICE" && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Pilihan A</label>
                          <KoreanInput type="text" name="option_a" defaultValue={editingQuestion?.option_a || ""} required placeholder="Teks Pilihan A..." className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Pilihan B</label>
                          <KoreanInput type="text" name="option_b" defaultValue={editingQuestion?.option_b || ""} required placeholder="Teks Pilihan B..." className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Pilihan C</label>
                          <KoreanInput type="text" name="option_c" defaultValue={editingQuestion?.option_c || ""} required placeholder="Teks Pilihan C..." className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Pilihan D</label>
                          <KoreanInput type="text" name="option_d" defaultValue={editingQuestion?.option_d || ""} required placeholder="Teks Pilihan D..." className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Kunci Jawaban 
                        {activeTab === "SPEAKING" || activeTab === "WRITING" ? " (Opsional/Panduan)" : " (Wajib)"}
                      </label>
                      <KoreanInput type="text" name="answer_key" defaultValue={editingQuestion?.answer_key || ""} required={activeTab === "READING" || activeTab === "LISTENING"} placeholder="Jawaban (atau 1 huruf A/B/C/D jika pilihan ganda)..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Kesulitan (1-5)</label>
                      <input type="number" name="difficulty" defaultValue={editingQuestion?.difficulty || 1} min="1" max="5" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    {activeTab === "LISTENING" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">File Audio {editingQuestion ? "(Opsional jika tidak ingin diubah)" : "(Wajib untuk Listening)"}</label>
                        <input type="file" accept="audio/*" name="audio_reference" required={!editingQuestion} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        {editingQuestion?.audio_reference && <p className="text-xs text-blue-600 mt-2">File saat ini sudah ada. Upload baru untuk mengganti.</p>}
                      </div>
                    )}
                    {activeTab === "READING" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Pendukung (Opsional)</label>
                        <input type="file" accept="image/*" name="image_url" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        {editingQuestion?.image_url && <p className="text-xs text-blue-600 mt-2">Gambar saat ini sudah ada. Upload baru untuk mengganti.</p>}
                      </div>
                    )}
                    {activeTab === "SPEAKING" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">File Audio Panduan (Opsional)</label>
                        <input type="file" accept="audio/*" name="audio_reference" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        {editingQuestion?.audio_reference && <p className="text-xs text-blue-600 mt-2">File saat ini sudah ada. Upload baru untuk mengganti.</p>}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={closeForm} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                      Batal
                    </button>
                    <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                      {editingQuestion ? "Simpan Perubahan" : `Simpan Soal ke ${tabs.find(t => t.id === activeTab)?.label}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredQuestions.map((q: any, idx: number) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium mb-3 whitespace-pre-wrap">{q.question_text}</p>

                  {q.image_url && (
                    <div className="mb-4">
                      <img src={q.image_url} alt="Soal Image" className="max-w-md rounded-xl border border-gray-200 shadow-sm" />
                    </div>
                  )}

                  {(q.option_a || q.option_b || q.option_c || q.option_d) && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div><span className="font-bold">A.</span> {q.option_a}</div>
                      <div><span className="font-bold">B.</span> {q.option_b}</div>
                      <div><span className="font-bold">C.</span> {q.option_c}</div>
                      <div><span className="font-bold">D.</span> {q.option_d}</div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {q.answer_key && (
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                        <span className="font-bold mr-1">Kunci:</span> {q.answer_key}
                      </div>
                    )}
                    {q.audio_reference && (
                      <a href={q.audio_reference} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Headphones className="w-4 h-4" /> Dengar Audio
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      Kesulitan: <span className="font-bold text-gray-700">Level {q.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => openEditForm(q)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Soal"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredQuestions.length === 0 && !showForm && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Belum ada soal untuk bagian {tabs.find(t => t.id === activeTab)?.label}.</p>
                <button onClick={() => setShowForm(true)} className="mt-4 text-namsan-primary font-bold hover:underline">
                  + Tambah Soal Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : viewMode === "ELIGIBILITY" ? (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Kelayakan Ujian (Absensi)</h2>
              <p className="text-gray-500 text-sm mt-1">Siswa membutuhkan tingkat kehadiran minimal 75% untuk dapat mengikuti ujian akhir ini.</p>
            </div>
            <button 
              onClick={handleAssignAllEligible}
              disabled={assigningAll}
              className="px-5 py-2.5 bg-namsan-primary hover:bg-namsan-primary/90 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigningAll ? "Memproses..." : "Assign Semua Siswa Memenuhi Syarat"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleStudents.map((s, idx) => (
              <div key={s.student.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                    {s.student.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-bold text-namsan-text truncate">{s.student.nama_lengkap}</div>
                    <div className="text-xs text-gray-500 truncate">@{s.student.username}</div>
                  </div>
                </div>
                
                <div className="space-y-2 flex-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sesi Hadir:</span>
                    <span className="font-medium text-gray-700">{s.presentCount} / {s.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Tingkat Absensi:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold border ${
                      s.attendanceRate >= 75 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {s.attendanceRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end">
                  {s.isAssigned ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 w-full justify-center">
                      <CheckCircle className="w-4 h-4" /> Ter-assign
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssignSingle(s.student.id)}
                      className="w-full px-4 py-2 border-2 border-namsan-primary text-namsan-primary hover:bg-namsan-primary hover:text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      Assign Siswa
                    </button>
                  )}
                </div>
              </div>
            ))}
            {eligibleStudents.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                Belum ada siswa terdaftar di kelas ini.
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "HASIL" ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <input 
              type="text" 
              placeholder="Cari nama atau username siswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exam.exam_attempts?.filter((a: any) => 
              a.student.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.student.username.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((attempt: any) => {
              const start = new Date(attempt.start_time);
              const end = attempt.end_time ? new Date(attempt.end_time) : null;
              const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

              return (
                <div key={attempt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                      {attempt.student.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-bold text-namsan-text truncate">{attempt.student.nama_lengkap}</div>
                      <div className="text-xs text-gray-500 truncate">@{attempt.student.username}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mulai:</span>
                      <span className="text-gray-700 font-medium">{start.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">Durasi:</span>
                      {end ? (
                        <span className="text-namsan-primary font-bold">{duration} menit</span>
                      ) : (
                        <span className="text-orange-500 text-[10px] font-bold px-2 py-0.5 bg-orange-50 rounded-lg">Sedang Mengerjakan</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    {attempt.end_time ? (
                      <>
                        <div className={`px-4 py-2 flex items-center justify-center rounded-xl font-black ${
                          (attempt.total_score || 0) >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          Skor: {attempt.total_score || 0}
                        </div>
                        <button 
                          onClick={() => { setSelectedAttempt(attempt); setViewMode("HASIL_DETAIL"); }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded-xl transition-colors"
                        >
                          Detail
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm italic w-full text-center">Menunggu selesai...</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {(!exam.exam_attempts || exam.exam_attempts.filter((a: any) => 
              a.student.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.student.username.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0) && (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                Belum ada data hasil ujian siswa yang cocok.
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "HASIL_DETAIL" && selectedAttempt ? (
        <div className="space-y-4">
          <button 
            onClick={() => { setViewMode("HASIL"); setSelectedAttempt(null); }}
            className="flex items-center gap-2 text-gray-500 hover:text-namsan-primary font-bold text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Tabel Hasil
          </button>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-4">
              Detail Hasil: {selectedAttempt.student.nama_lengkap} (@{selectedAttempt.student.username})
            </h3>
            <SiswaHasilClient attempt={{...selectedAttempt, exam: exam}} hideBackLink={true} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
