"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, FileQuestion, Trash2, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createQuestion } from "@/app/actions/pengajar";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";

export default function PengajarKuisDetailClient({ exam }: { exam: any }) {
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");
  const [error, setError] = useState("");

  const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("exam_id", exam.id);
    
    const res = await createQuestion(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      window.location.reload();
    }
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

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-namsan-text flex items-center gap-2">
          <FileQuestion className="w-6 h-6 text-namsan-primary" /> Daftar Soal ({exam.questions.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          {showForm ? "Batal" : <><Plus className="w-4 h-4" /> Tambah Soal</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Buat Soal Baru</h2>
          {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
          
          <form onSubmit={handleCreateQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
              <select name="type" value={questionType} onChange={(e) => setQuestionType(e.target.value)} required className="w-full p-2.5 border rounded-lg bg-white">
                <option value="MULTIPLE_CHOICE">Pilihan Ganda (Otomatis Dinilai)</option>
                <option value="LISTENING">Listening (Audio & Teks)</option>
                <option value="SPEAKING">Speaking (AI Voice Analysis)</option>
                <option value="WRITING">Writing (Esai)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kesulitan (1-5)</label>
              <input type="number" name="difficulty" min="1" max="5" defaultValue="1" required className="w-full p-2.5 border rounded-lg" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Pertanyaan</label>
              <KoreanTextarea 
                name="question_text" 
                required 
                rows={3} 
                placeholder="Ketik soal di sini..." 
                className="w-full p-2.5 border rounded-lg" 
              />
            </div>

            {questionType === "LISTENING" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Audio Reference (URL MP3)</label>
                <input type="url" name="audio_reference" required placeholder="https://..." className="w-full p-2.5 border rounded-lg" />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kunci Jawaban</label>
              <KoreanInput 
                type="text" 
                name="answer_key" 
                placeholder="A/B/C/D atau Teks Jawaban (Wajib untuk Pilihan Ganda)" 
                className="w-full p-2.5 border rounded-lg" 
              />
              {questionType === "MULTIPLE_CHOICE" && (
                <p className="text-xs text-gray-500 mt-1">*Jika Pilihan Ganda, format soal di atas bisa berupa teks soal beserta opsi A, B, C, D. Lalu isi Kunci Jawaban dengan 1 huruf saja (A/B/C/D).</p>
              )}
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="w-full bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3 px-4 rounded-lg">
                Simpan Soal
              </button>
            </div>
          </form>
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
              
              {q.audio_reference && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> File Audio Terlampir
                </div>
              )}

              {q.answer_key && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Kunci: {q.answer_key}
                </div>
              )}
            </div>
            {/* Trash button can be implemented later */}
          </div>
        ))}

        {exam.questions.length === 0 && (
          <div className="text-center p-8 bg-white border border-gray-100 border-dashed rounded-xl">
            <p className="text-gray-500">Belum ada soal untuk kuis ini. Klik Tambah Soal di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
