"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, FileQuestion, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PengajarUjianDetailClient({ exam }: { exam: any }) {
  const [activeTab, setActiveTab] = useState<"SOAL" | "HASIL">("SOAL");

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
          onClick={() => setActiveTab("HASIL")}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "HASIL" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-namsan-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Segera Hadir</h2>
          <p className="text-gray-500">Fitur rekap nilai siswa sedang dalam pengembangan. Anda akan segera dapat melihat rekap skor di sini.</p>
        </div>
      )}
    </div>
  );
}
