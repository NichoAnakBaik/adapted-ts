"use client";

import React, { useState } from "react";
import { ArrowLeft, ClipboardList, Clock, FileQuestion, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SiswaUjianClient({ exams, className }: { exams: any[], className?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExams = exams.filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/siswa/ujian" className="inline-flex items-center gap-2 text-gray-500 hover:text-namsan-primary font-bold text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
      </Link>
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Ujian Akhir {className ? `- Kelas ${className}` : ''}</h1>
            <p className="text-sm text-namsan-text-muted">Selesaikan Ujian Akhir untuk melanjutkan ke level berikutnya.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari judul ujian atau nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((ex) => {
          const attempt = ex.exam_attempts && ex.exam_attempts.length > 0 ? ex.exam_attempts[0] : null;

          return (
            <div key={ex.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  {ex.class.name}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                  Ujian Akhir
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-namsan-text mb-2 group-hover:text-namsan-primary transition-colors">{ex.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                {ex.description || "Tidak ada deskripsi"}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SOAL</span>
                  <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                    <FileQuestion className="w-4 h-4 text-blue-500" />
                    {ex._count.questions}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-namsan-text-muted font-bold tracking-wider">WAKTU</span>
                  <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {ex.time_limit ? `${ex.time_limit}m` : 'Bebas'}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                {attempt ? (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-bold">NILAI KAMU</span>
                      <span className="text-lg font-bold text-green-600">{attempt.total_score}</span>
                    </div>
                    <Link 
                      href={`/siswa/ujian/${ex.id}/hasil`}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Lihat Hasil <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <Link 
                    href={`/siswa/kuis/${ex.id}`} 
                    className="w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Kerjakan Ujian <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {filteredExams.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Ujian Akhir</h3>
            <p className="text-gray-500 mt-2">Pengajar belum mempublikasikan Ujian Akhir untuk kelas yang Anda ikuti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
