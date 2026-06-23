"use client";

import React, { useState } from "react";
import { ClipboardList, Users, Clock, FileQuestion, BadgeInfo } from "lucide-react";

export default function AdminKuisClient({ initialQuizzes }: { initialQuizzes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = initialQuizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.class.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pantau Kuis</h1>
            <p className="text-sm text-namsan-text-muted">Monitor seluruh kuis harian yang dikelola oleh para pengajar.</p>
          </div>
        </div>
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
          <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="p-5 border-b border-gray-50 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700">
                  <BadgeInfo className="w-3 h-3" /> {quiz.class.name}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${quiz.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {quiz.is_published ? 'Dipublikasi' : 'Draft'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-namsan-text mb-2 line-clamp-2">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                {quiz.description || "Tidak ada deskripsi"}
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm mt-auto">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{quiz.time_limit ? `${quiz.time_limit} Menit` : 'Tanpa Batas'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <FileQuestion className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{quiz._count.questions} Soal</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Users className="w-4 h-4" /> Pengajar: <span className="font-bold text-gray-700">{quiz.class.teacher?.nama_lengkap || '-'}</span>
                </span>
                <span className="font-bold text-namsan-primary">{quiz._count.exam_attempts} Pengerjaan</span>
              </div>
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
