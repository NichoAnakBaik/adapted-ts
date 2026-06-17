"use client";

import React from "react";
import { FileQuestion, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function PengajarUjianClient({ exams }: { exams: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <FileQuestion className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pemantauan Ujian Akhir</h1>
            <p className="text-sm text-namsan-text-muted">Pantau soal ujian akhir dan hasil tes siswa di kelas Anda.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Ujian Akhir dikelola sepenuhnya oleh Administrator. Sebagai Pengajar, Anda hanya memiliki akses baca (Read-Only) untuk melihat butir soal dan memantau hasil nilai siswa dari kelas yang Anda ampu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((ex) => (
          <Link key={ex.id} href={`/pengajar/ujian/${ex.id}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {ex.class.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${ex.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {ex.is_published ? 'Aktif' : 'Draft Admin'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 group-hover:text-namsan-primary transition-colors">{ex.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
              {ex.description || "Tidak ada deskripsi"}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-auto">
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SOAL</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <FileQuestion className="w-4 h-4 text-blue-500" />
                  {ex._count.questions} Soal
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">WAKTU</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {ex.time_limit ? `${ex.time_limit} Menit` : 'Tanpa Batas'}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Ujian</h3>
            <p className="text-gray-500 mt-2">Belum ada Ujian Akhir yang didistribusikan ke kelas Anda oleh Admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
