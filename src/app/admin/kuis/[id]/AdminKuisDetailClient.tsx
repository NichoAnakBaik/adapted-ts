"use client";

import React, { useState } from "react";
import { FileQuestion, ArrowLeft, Headphones, BookOpen, PenTool, MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import SiswaHasilClient from "@/app/siswa/kuis/[id]/hasil/SiswaHasilClient";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function AdminKuisDetailClient({ exam }: { exam: any }) {
  const [questions] = useState(exam.questions);
  const [activeTab, setActiveTab] = useState<"SPEAKING" | "LISTENING" | "READING" | "WRITING">("READING");
  const [viewMode, setViewMode] = useState<"SOAL" | "HASIL" | "HASIL_DETAIL">("SOAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const tabs = [
    { id: "READING", label: "Membaca (Reading)", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "WRITING", label: "Menulis (Writing)", icon: PenTool, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "LISTENING", label: "Mendengar (Listening)", icon: Headphones, color: "text-green-500", bg: "bg-green-50" },
    { id: "SPEAKING", label: "Berbicara (Speaking)", icon: MessageCircle, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const filteredQuestions = questions.filter((q: any) => q.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Link href={`/admin/kuis/kelas/${exam.class_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-namsan-primary font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis Kelas
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 mb-3">
            Kelas: {exam.class.name}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h1>
          <p className="text-gray-500 text-sm max-w-2xl">{exam.description || "Tidak ada deskripsi kuis."}</p>
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
          Lihat Soal Kuis
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
                  onClick={() => setActiveTab(tab.id as any)}
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
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group transition-colors">
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
                        <div className="w-full mt-2">
                          <AudioPlayer src={q.audio_reference} className="max-w-xs" />
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500">
                        Kesulitan: <span className="font-bold text-gray-700">Level {q.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada soal untuk bagian ini.</p>
                </div>
              )}
            </div>
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
