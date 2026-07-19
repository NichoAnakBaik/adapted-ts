"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, FileQuestion, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import SiswaHasilClient from "@/app/siswa/kuis/[id]/hasil/SiswaHasilClient";

export default function PengajarUjianDetailClient({ exam }: { exam: any }) {
  const [activeTab, setActiveTab] = useState<"SOAL" | "HASIL" | "HASIL_DETAIL">("SOAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pengajar/ujian" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-namsan-text">{exam.title}</h1>
          <p className="text-sm text-namsan-text-muted">{exam.class.name} • Read Only</p>
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
            Soal Ujian ({exam.questions.length})
          </div>
        </button>
        <button
          onClick={() => { setActiveTab("HASIL"); setSelectedAttempt(null); }}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "HASIL" || activeTab === "HASIL_DETAIL" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Hasil Siswa
          </div>
        </button>
      </div>

      {activeTab === "SOAL" && (
        <div className="space-y-4">
          {exam.questions.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500">Belum ada soal pada ujian ini.</p>
            </div>
          ) : (
            exam.questions.map((q: any, index: number) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-namsan-text-muted">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      {q.type}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Difficulty: {q.difficulty}/5</span>
                  </div>
                  <p className="text-namsan-text font-medium whitespace-pre-wrap">{q.question_text}</p>
                  
                  {q.image_url && (
                    <div className="mt-3 mb-2">
                      <img src={q.image_url} alt="Gambar Soal" className="max-w-xs md:max-w-md rounded-xl border border-gray-200" />
                    </div>
                  )}

                  {(q.option_a || q.option_b || q.option_c || q.option_d) && (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div><span className="font-bold">A.</span> {q.option_a}</div>
                      <div><span className="font-bold">B.</span> {q.option_b}</div>
                      <div><span className="font-bold">C.</span> {q.option_c}</div>
                      <div><span className="font-bold">D.</span> {q.option_d}</div>
                    </div>
                  )}

                  {q.audio_reference && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> File Audio Terlampir
                    </div>
                  )}

                  {q.answer_key && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                      <span className="font-bold">Kunci Jawaban:</span> {q.answer_key}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "HASIL" && (
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
                          onClick={() => { setSelectedAttempt(attempt); setActiveTab("HASIL_DETAIL"); }}
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
