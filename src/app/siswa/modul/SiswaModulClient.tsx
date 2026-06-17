"use client";

import React from "react";
import { BookOpen, FileText, Headphones, PlayCircle } from "lucide-react";

export default function SiswaModulClient({ modules }: { modules: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-namsan-soft rounded-xl">
            <BookOpen className="w-8 h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Modul Belajar</h1>
            <p className="text-sm text-namsan-text-muted">Akses materi PDF dan Audio dari seluruh kelas Anda.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                {m.class.name}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-1 group-hover:text-namsan-primary transition-colors">{m.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Oleh: {m.class.teacher?.nama_lengkap || "Pengajar Namsan"}
            </p>

            <div className="flex gap-3 mt-auto">
              {m.pdf_url && (
                <a 
                  href={m.pdf_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" /> Baca PDF
                </a>
              )}
              {m.audio_url && (
                <a 
                  href={m.audio_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  <Headphones className="w-4 h-4" /> Dengar Audio
                </a>
              )}
              {!m.pdf_url && !m.audio_url && (
                <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-400 font-bold py-2.5 px-4 rounded-xl text-sm">
                  Belum ada lampiran
                </div>
              )}
            </div>
          </div>
        ))}
        
        {modules.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Modul</h3>
            <p className="text-gray-500 mt-2">Anda belum terdaftar di kelas manapun, atau belum ada modul yang diunggah oleh Pengajar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
