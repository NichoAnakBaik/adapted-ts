"use client";

import React from "react";
import { ClipboardList, Clock, FileQuestion, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SiswaKuisClient({ exams }: { exams: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Kuis & Ujian</h1>
            <p className="text-sm text-namsan-text-muted">Uji kemampuan bahasa Koreamu melalui kuis interaktif.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((ex) => {
          const attempt = ex.exam_attempts && ex.exam_attempts.length > 0 ? ex.exam_attempts[0] : null;

          return (
            <div key={ex.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  {ex.class.name}
                </span>
                {ex.is_final && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                    Ujian Akhir
                  </span>
                )}
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
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={`/siswa/kuis/${ex.id}`} 
                    className="w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Kerjakan Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {exams.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Kuis</h3>
            <p className="text-gray-500 mt-2">Pengajar belum mempublikasikan kuis untuk kelas yang Anda ikuti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
