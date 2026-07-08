"use client";

import React, { useState } from "react";
import { FileQuestion, Users, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function PengajarUjianIndexClient({ classes }: { classes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <FileQuestion className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Pilih Kelas untuk Ujian Akhir</h1>
            <p className="text-sm text-namsan-text-muted">Pilih kelas di bawah ini untuk memantau ujian akhir.</p>
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
          <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-namsan-text group-hover:text-namsan-primary transition-colors">{c.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
                  {c.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <FileQuestion className="w-4 h-4 text-gray-400" />
                Ujian Akhir
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Users className="w-4 h-4 text-gray-400" />
                {c._count?.enrollments || 0} Siswa
              </div>
            </div>

            <Link href={`/pengajar/ujian/kelas/${c.id}`} className="mt-auto w-full bg-namsan-soft hover:bg-namsan-primary text-namsan-primary hover:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Pantau Ujian <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}

        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center p-8 text-gray-500">
            Tidak ada kelas yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
