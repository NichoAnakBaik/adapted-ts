"use client";

import React, { useState } from "react";
import { FileQuestion, ArrowLeft, Plus, Trash2, Headphones, BookOpen, PenTool, MessageCircle } from "lucide-react";
import Link from "next/link";
import { createAdminQuestion, deleteAdminQuestion } from "@/app/actions/admin";
import { KoreanInput, KoreanTextarea } from "@/components/KoreanInput";

export default function AdminUjianDetailClient({ exam }: { exam: any }) {
  const [questions, setQuestions] = useState(exam.questions);
  const [activeTab, setActiveTab] = useState<"SPEAKING" | "LISTENING" | "READING" | "WRITING">("READING");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

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

    const res = await createAdminQuestion(formData);
    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || "Terjadi kesalahan");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return;
    const res = await deleteAdminQuestion(id);
    if (res.success) {
      setQuestions(questions.filter((q: any) => q.id !== id));
    }
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
              onClick={() => setShowForm(!showForm)}
              className="bg-white border-2 border-namsan-primary text-namsan-dark hover:bg-namsan-primary font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              {showForm ? "Batal Tambah" : <><Plus className="w-5 h-5" /> Tambah Soal</>}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-8 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Buat Soal {tabs.find(t => t.id === activeTab)?.label} Baru</h3>
              {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
              
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teks Soal / Pertanyaan</label>
                  <KoreanTextarea name="question_text" required rows={3} placeholder="Masukkan soal dalam bahasa Indonesia atau Korea..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Kunci Jawaban 
                      {activeTab === "SPEAKING" || activeTab === "WRITING" ? " (Opsional/Panduan)" : " (Wajib)"}
                    </label>
                    <KoreanInput type="text" name="answer_key" required={activeTab === "READING" || activeTab === "LISTENING"} placeholder="Kunci jawaban persis..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Kesulitan (1-5)</label>
                    <input type="number" name="difficulty" min="1" max="5" defaultValue="1" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {activeTab === "LISTENING" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Link Audio File (Wajib untuk Listening)</label>
                      <input type="url" name="audio_reference" required placeholder="https://..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  )}
                  {activeTab === "SPEAKING" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Link Audio Panduan (Opsional)</label>
                      <input type="url" name="audio_reference" placeholder="https://..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all">
                    Simpan Soal ke {tabs.find(t => t.id === activeTab)?.label}
                  </button>
                </div>
              </form>
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
                <div>
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
    </div>
  );
}
