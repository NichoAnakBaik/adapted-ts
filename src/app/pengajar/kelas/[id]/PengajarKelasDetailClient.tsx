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
          <div className="mt-3 space-y-2">
            {classData.module_link ? (
              <p className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <BookOpen className="w-4 h-4 text-namsan-primary" />
                <span className="font-bold">Modul (GDrive):</span> 
                <a href={classData.module_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all max-w-[200px] truncate">
                  {classData.module_link}
                </a>
                <button 
                  onClick={async () => {
                    const newLink = prompt("Ubah Link Modul (Gunakan Google Drive dll):", classData.module_link || "");
                    if (newLink !== null) {
                      const { updateModuleLink } = await import("@/app/actions/pengajar");
                      const res = await updateModuleLink(classData.id, newLink);
                      if (res.error) alert(res.error);
                      else window.location.reload();
                    }
                  }}
                  className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded transition-colors"
                >
                  Ubah Link
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-400">Modul belum tersedia.</span> 
                <button 
                  onClick={async () => {
                    const newLink = prompt("Masukkan Link Modul (Gunakan Google Drive dll):");
                    if (newLink) {
                      const { updateModuleLink } = await import("@/app/actions/pengajar");
                      const res = await updateModuleLink(classData.id, newLink);
                      if (res.error) alert(res.error);
                      else window.location.reload();
                    }
                  }}
                  className="ml-2 text-xs bg-namsan-primary hover:bg-namsan-primary/90 text-white font-bold py-1 px-2 rounded transition-colors"
                >
                  Tambah Modul
                </button>
              </p>
            )}
            
            {classData.type === 'ONLINE' && (
              <div className="text-sm text-gray-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Link Meeting:</span>
                  {classData.meeting_link ? (
                    <a href={classData.meeting_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-xs">
                      {classData.meeting_link}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Belum ada link meeting</span>
                  )}
                  
                  <button 
                    onClick={async () => {
                      const newLink = prompt("Masukkan Link Meeting (Zoom/GMeet):", classData.meeting_link || "");
                      if (newLink !== null) {
                        const { updateMeetingLink } = await import("@/app/actions/pengajar");
                        const res = await updateMeetingLink(classData.id, newLink);
                        if (res.error) alert(res.error);
                        else window.location.reload();
                      }
                    }}
                    className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded transition-colors"
                  >
                    {classData.meeting_link ? "Ubah Link" : "Tambah Link"}
                  </button>
                </div>
              </div>
            )}
          </div>
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
            Materi Modul
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
          <BookOpen className="w-16 h-16 text-namsan-primary/50 mx-auto" />
          <h2 className="text-xl font-bold text-namsan-text">Materi Kelas</h2>
          {classData.module_link ? (
            <div>
              <p className="text-gray-500 mb-6">Materi modul telah dibagikan melalui tautan eksternal (Google Drive / Cloud).</p>
              <a href={classData.module_link} target="_blank" rel="noreferrer" className="inline-block bg-namsan-primary hover:bg-namsan-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm">
                Buka Tautan Modul
              </a>
            </div>
          ) : (
            <p className="text-gray-500">Materi modul belum tersedia. Silakan tambahkan link modul di atas agar siswa dapat mengaksesnya.</p>
          )}
        </div>
      )}
    </div>
  );
}
