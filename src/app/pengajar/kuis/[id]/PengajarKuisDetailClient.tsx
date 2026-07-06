"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, FileQuestion, Trash2, Pencil, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createQuestion, updateQuestion } from "@/app/actions/pengajar";
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

export default function PengajarKuisDetailClient({ exam }: { exam: any }) {
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState("READING");
  const [questionFormat, setQuestionFormat] = useState("MULTIPLE_CHOICE");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"SOAL" | "HASIL" | "HASIL_DETAIL">("SOAL");
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("exam_id", exam.id);
    
    try {
      // Convert File inputs to Base64 safely
      const audioFile = formData.get("audio_reference") as File | null;
      if (audioFile && audioFile.size > 0) {
        const base64 = await fileToBase64(audioFile);
        formData.append("audio_b64", base64);
        formData.delete("audio_reference"); // Remove original file
      }

      const imageFile = formData.get("image_url") as File | null;
      if (imageFile && imageFile.size > 0) {
        const base64 = await fileToBase64(imageFile);
        formData.append("image_b64", base64);
        formData.delete("image_url"); // Remove original file
      }

      let res;
      if (editingQuestion) {
        formData.append("id", editingQuestion.id);
        res = await updateQuestion(formData);
      } else {
        res = await createQuestion(formData);
      }
      
      if (res.error) {
        setError(res.error);
      } else {
        setShowForm(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan soal. Pastikan file tidak terlalu besar.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const openEditForm = (q: any) => {
    setEditingQuestion(q);
    setQuestionType(q.type || "READING");
    setQuestionFormat(q.format || "MULTIPLE_CHOICE");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setQuestionType("READING");
    setQuestionFormat("MULTIPLE_CHOICE");
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/pengajar/kuis" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-namsan-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-namsan-text mb-2">{exam.title}</h1>
            <div className="flex gap-3 text-sm mb-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold">
                {exam.class.name}
              </span>
              <span className={`px-3 py-1 rounded-full font-bold ${exam.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {exam.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{exam.description || "Tidak ada deskripsi."}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end text-namsan-text font-bold mb-1">
              <Clock className="w-5 h-5 text-orange-500" />
              {exam.time_limit ? `${exam.time_limit} Menit` : 'Waktu Bebas'}
            </div>
            <div className="text-sm text-gray-500">Batas Pengerjaan</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("SOAL")}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "SOAL" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            Daftar Soal ({exam.questions.length})
          </div>
        </button>
        <button
          onClick={() => { setActiveTab("HASIL"); setSelectedAttempt(null); }}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "HASIL" || activeTab === "HASIL_DETAIL" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Hasil Pengerjaan
          </div>
        </button>
      </div>

      {activeTab === "SOAL" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => showForm ? closeForm() : setShowForm(true)}
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              {showForm ? "Batal" : <><Plus className="w-4 h-4" /> Tambah Soal</>}
            </button>
          </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">{editingQuestion ? "Edit Soal" : "Buat Soal Baru"}</h2>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreateQuestion} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Kemahiran</label>
                <select 
                  name="type" 
                  value={questionType} 
                  onChange={(e) => {
                    const newType = e.target.value;
                    setQuestionType(newType);
                    if (newType === "SPEAKING" || newType === "WRITING") {
                      setQuestionFormat("ESSAY");
                    } else {
                      setQuestionFormat("MULTIPLE_CHOICE");
                    }
                  }} 
                  required 
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="READING">Reading (Membaca/Teks)</option>
                  <option value="LISTENING">Listening (Mendengarkan Audio)</option>
                  <option value="SPEAKING">Speaking (Pelafalan/Voice)</option>
                  <option value="WRITING">Writing (Menulis)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format Jawaban</label>
                <select 
                  name="format" 
                  value={questionFormat} 
                  onChange={(e) => setQuestionFormat(e.target.value)} 
                  required 
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  {(questionType === "READING" || questionType === "LISTENING") && (
                    <option value="MULTIPLE_CHOICE">Pilihan Ganda (A, B, C, D)</option>
                  )}
                  <option value="ESSAY">Isian Bebas / Esai / Perekaman</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kesulitan (1-5)</label>
                <input type="number" name="difficulty" min="1" max="5" defaultValue={editingQuestion?.difficulty || 1} required className="w-full p-2.5 border rounded-lg" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Pertanyaan</label>
                <KoreanTextarea 
                  name="question_text" 
                  defaultValue={editingQuestion?.question_text || ""}
                  required 
                  rows={3} 
                  placeholder="Ketik soal di sini..." 
                  className="w-full p-2.5 border rounded-lg" 
                />
              </div>

              {/* All types can have optional image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Soal {editingQuestion ? "(Opsional jika tidak ingin diubah)" : "(Opsional)"}</label>
                <input type="file" accept="image/*" name="image_url" className="w-full p-2.5 border rounded-lg bg-white" />
                {editingQuestion?.image_url && <p className="text-xs text-blue-600 mt-2">File gambar saat ini sudah ada. Upload baru untuk mengganti.</p>}
              </div>

              {/* All types can optionally have audio, but LISTENING might require it */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">File Audio MP3 {editingQuestion ? "(Opsional jika tidak ingin diubah)" : "(Opsional / Wajib untuk Listening)"}</label>
                <input type="file" accept="audio/*" name="audio_reference" className="w-full p-2.5 border rounded-lg bg-white" required={questionType === "LISTENING" && !editingQuestion} />
                {editingQuestion?.audio_reference && <p className="text-xs text-blue-600 mt-2">File audio saat ini sudah ada. Upload baru untuk mengganti.</p>}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Kunci Jawaban</label>
                <KoreanInput 
                  type="text" 
                  name="answer_key" 
                  defaultValue={editingQuestion?.answer_key || ""}
                  placeholder="Kunci Jawaban (contoh: A, atau teks isian)" 
                  className="w-full p-2.5 border rounded-lg" 
                />
              </div>

              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  {editingQuestion ? "Simpan Perubahan" : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {exam.questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-namsan-text-muted">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  q.type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700' :
                  q.type === 'LISTENING' ? 'bg-purple-100 text-purple-700' :
                  q.type === 'SPEAKING' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {q.type}
                </span>
                <span className="text-xs text-gray-400 font-medium">Difficulty: {q.difficulty}/5</span>
              </div>
              <p className="text-namsan-text font-medium whitespace-pre-wrap">{q.question_text}</p>
              
              {(q.format === 'MULTIPLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (q.option_a || q.option_b || q.option_c || q.option_d) && (
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div><span className="font-bold">A.</span> {q.option_a}</div>
                  <div><span className="font-bold">B.</span> {q.option_b}</div>
                  <div><span className="font-bold">C.</span> {q.option_c}</div>
                  <div><span className="font-bold">D.</span> {q.option_d}</div>
                </div>
              )}

              {q.image_url && (
                <div className="mt-3">
                  <span className="text-sm text-gray-500 block mb-1">Gambar:</span>
                  <img src={q.image_url} alt="Gambar Soal" className="max-w-md rounded-xl border border-gray-200" />
                </div>
              )}

              {q.audio_reference && (
                <div className="mt-3">
                  <span className="text-sm text-gray-500 block mb-1">Audio:</span>
                  <audio controls src={q.audio_reference} className="w-full max-w-md h-10" />
                </div>
              )}

              {q.answer_key && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Kunci: {q.answer_key}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => openEditForm(q)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                title="Edit Soal"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="text-center p-8 bg-white border border-gray-100 border-dashed rounded-xl">
            <p className="text-gray-500">Belum ada soal untuk kuis ini. Klik Tambah Soal di atas.</p>
          </div>
        )}
        </div>
        </>
      )}

      {activeTab === "HASIL" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] inline-block align-middle">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                    <th className="p-4 font-bold text-namsan-text-muted">Nama Siswa</th>
                    <th className="p-4 font-bold text-namsan-text-muted text-center">Skor</th>
                    <th className="p-4 font-bold text-namsan-text-muted">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exam.exam_attempts?.map((attempt: any) => (
                    <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{attempt.student.nama_lengkap || attempt.student.username}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
                          {attempt.total_score !== null ? attempt.total_score : '-'} / 100
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 flex items-center gap-4 justify-between">
                        <span>{new Date(attempt.end_time || attempt.created_at).toLocaleString('id-ID')}</span>
                        <button 
                          onClick={() => { setSelectedAttempt(attempt); setActiveTab("HASIL_DETAIL"); }}
                          className="text-namsan-primary font-bold hover:underline"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!exam.exam_attempts || exam.exam_attempts.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">Belum ada siswa yang mengerjakan kuis ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "HASIL_DETAIL" && selectedAttempt && (
        <div className="space-y-4">
          <button 
            onClick={() => { setActiveTab("HASIL"); setSelectedAttempt(null); }}
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
      )}
    </div>
  );
}
