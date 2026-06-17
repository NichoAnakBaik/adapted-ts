"use client";

import React, { useState } from "react";
import { Users, BookOpen, ArrowLeft, Calendar, FileText, Headphones } from "lucide-react";
import Link from "next/link";

export default function PengajarKelasDetailClient({ classData }: { classData: any }) {
  const [activeTab, setActiveTab] = useState<"SISWA" | "MODUL">("SISWA");
  const modules = classData.modules || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pengajar/kelas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-namsan-text">{classData.name}</h1>
          <p className="text-sm text-namsan-text-muted">Detail Kelas, Siswa, dan Modul Pembelajaran</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("SISWA")}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "SISWA" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Daftar Siswa ({classData.enrollments.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("MODUL")}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "MODUL" ? "border-namsan-primary text-namsan-primary" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Modul Pembelajaran ({modules.length})
          </div>
        </button>
      </div>

      {activeTab === "SISWA" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {classData.enrollments.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Belum ada siswa yang terdaftar di kelas ini.</p>
              </div>
            ) : (
              classData.enrollments.map((enrollment: any, index: number) => (
                <div key={enrollment.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-namsan-primary font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{enrollment.student.nama_lengkap || enrollment.student.username}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Bergabung: {new Date(enrollment.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "MODUL" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                  <th className="p-4 font-bold text-namsan-text-muted">Judul Modul</th>
                  <th className="p-4 font-bold text-namsan-text-muted text-center">Lampiran</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m: any) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-namsan-text">{m.title}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {m.pdf_url ? (
                          <a href={m.pdf_url} target="_blank" rel="noreferrer" className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="Buka PDF">
                            <FileText className="w-5 h-5" />
                          </a>
                        ) : <span className="w-5 h-5 opacity-20"><FileText className="w-5 h-5" /></span>}
                        
                        {m.audio_url ? (
                          <a href={m.audio_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-1.5 rounded" title="Putar Audio">
                            <Headphones className="w-5 h-5" />
                          </a>
                        ) : <span className="w-5 h-5 opacity-20"><Headphones className="w-5 h-5" /></span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-gray-500">Belum ada modul yang didistribusikan oleh Admin untuk kelas ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
