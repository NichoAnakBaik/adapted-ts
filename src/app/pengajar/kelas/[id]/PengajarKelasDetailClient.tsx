"use client";

import React from "react";
import { Users, GraduationCap, ArrowLeft, Mail, Calendar } from "lucide-react";
import Link from "next/link";

export default function PengajarKelasDetailClient({ classData }: { classData: any }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pengajar/kelas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-namsan-text">{classData.name}</h1>
          <p className="text-sm text-namsan-text-muted">Detail Kelas dan Daftar Siswa</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Users className="w-5 h-5 text-namsan-primary" />
          <h2 className="text-lg font-bold text-gray-800">Daftar Siswa Terdaftar ({classData.enrollments.length})</h2>
        </div>
        
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
                    <h3 className="text-lg font-bold text-gray-900">{enrollment.user.nama_lengkap || enrollment.user.username}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {enrollment.user.email}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Bergabung: {new Date(enrollment.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
