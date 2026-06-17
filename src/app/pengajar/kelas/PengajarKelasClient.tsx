"use client";

import React from "react";
import { Users, BookOpen, GraduationCap } from "lucide-react";

export default function PengajarKelasClient({ classes }: { classes: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Users className="w-8 h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Kelas Saya</h1>
            <p className="text-sm text-namsan-text-muted">Pantau kelas yang Anda ampu beserta metrik siswanya.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-namsan-soft rounded-lg">
                <GraduationCap className="w-6 h-6 text-namsan-dark" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {c.type}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 line-clamp-1">{c.name}</h3>
            
            {c.schedule && (
              <p className="text-sm text-gray-500 mb-6 flex-1">
                Jadwal: {c.schedule}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-auto">
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">SISWA</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <Users className="w-4 h-4 text-namsan-primary" />
                  {c._count?.enrollments || 0}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">MODUL</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  {c._count?.modules || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {classes.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Kelas</h3>
            <p className="text-gray-500 mt-2">Anda belum ditugaskan untuk mengajar kelas manapun oleh Admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
