"use client";

import React from "react";
import { BookOpen, FileText, Headphones } from "lucide-react";

export default function PengajarModulGlobalClient({ modules }: { modules: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-3 bg-namsan-soft rounded-xl">
          <BookOpen className="w-8 h-8 text-namsan-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-namsan-text">Pantau Modul Belajar</h1>
          <p className="text-sm text-namsan-text-muted">Kumpulan modul untuk kelas yang Anda ajar.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                <th className="p-4 font-bold text-namsan-text-muted">Judul Modul</th>
                <th className="p-4 font-bold text-namsan-text-muted">Kelas</th>
                <th className="p-4 font-bold text-namsan-text-muted text-center">Lampiran</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-namsan-text">{m.title}</td>
                  <td className="p-4 text-gray-500">{m.class?.name || "Global"}</td>
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
                  <td colSpan={3} className="p-8 text-center text-gray-500">Belum ada modul untuk kelas Anda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
