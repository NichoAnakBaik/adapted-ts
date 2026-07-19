"use client";

import React, { useState } from "react";
import { ArrowLeft, ClipboardList, Users, Clock, FileQuestion, BadgeInfo, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminKuisClient({ initialQuizzes, className, classId }: { initialQuizzes: any[], className?: string, classId?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = initialQuizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pantau Kuis {className ? `- Kelas ${className}` : ''}</h1>
            <p className="text-sm text-namsan-text-muted">Monitor seluruh kuis harian yang dikelola oleh para pengajar.</p>
          </div>
        </div>
        {classId && (
          <div className="flex items-center gap-3">
            <Link href="/admin/kuis" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors">
              Kembali
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari judul kuis atau nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {quiz.class.name}
              </span>
              <div className="flex gap-2">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> {quiz.class.teacher?.nama_lengkap || '-'}
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 group-hover:text-namsan-primary transition-colors">{quiz.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
              {quiz.description || "Tidak ada deskripsi"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SOAL</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <FileQuestion className="w-4 h-4 text-blue-500" />
                  {quiz._count?.questions || 0} Soal
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">WAKTU</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {quiz.time_limit ? `${quiz.time_limit} Menit` : 'Tanpa Batas'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex flex-col">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  quiz.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {quiz.is_published ? "🟢 PUBLISHED" : "⚫ DRAFT"}
                </span>
              </div>

              <Link href={`/admin/kuis/${quiz.id}`} className="text-sm font-bold text-namsan-primary hover:text-namsan-secondary flex items-center gap-1">
                Pantau Detail <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {filteredQuizzes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum Ada Kuis</h3>
            <p className="text-gray-500">Kuis yang dibuat oleh pengajar akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
