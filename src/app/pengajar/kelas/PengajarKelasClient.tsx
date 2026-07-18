"use client";

import React, { useState } from "react";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function PengajarKelasClient({ classes }: { classes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <input 
          type="text" 
          placeholder="Cari nama kelas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-namsan-primary outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((c) => (
          <Link key={c.id} href={`/pengajar/kelas/${c.id}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-namsan-primary transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-namsan-soft rounded-lg group-hover:bg-blue-100 transition-colors">
                <GraduationCap className="w-6 h-6 text-namsan-dark group-hover:text-namsan-primary transition-colors" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {c.type}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-2 line-clamp-1 group-hover:text-namsan-primary transition-colors">{c.name}</h3>
            
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
                <span className="text-xs text-namsan-text-muted font-bold tracking-wider">KUIS</span>
                <div className="flex items-center gap-1.5 text-namsan-text font-bold">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  {c._count?.exams || 0}
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {filteredClasses.length === 0 && (
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
