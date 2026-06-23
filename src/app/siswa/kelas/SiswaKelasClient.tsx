"use client";

import React from "react";
import { BookOpen, FileText, Video, Calendar, ArrowRight } from "lucide-react";

export default function SiswaKelasClient({ classes }: { classes: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-namsan-soft rounded-xl">
            <BookOpen className="w-8 h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Kelas Saya</h1>
            <p className="text-sm text-namsan-text-muted">Akses informasi kelas, modul, dan link online meeting.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-namsan-primary transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {c.type}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-namsan-text mb-1 group-hover:text-namsan-primary transition-colors">{c.name}</h3>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {c.schedule || "Jadwal belum ditentukan"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Pengajar: {c.teacher?.nama_lengkap || "Belum ada pengajar"}
            </p>

            <div className="flex flex-col gap-3 mt-auto border-t border-gray-50 pt-4">
              {c.module_link && (
                <a 
                  href={c.module_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full flex items-center justify-between bg-namsan-soft hover:bg-namsan-primary/20 text-namsan-dark font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Akses Modul GDrive</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              
              {c.type === 'ONLINE' && c.meeting_link && (
                <a 
                  href={c.meeting_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Masuk Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}

              {c.type === 'ONLINE' && !c.meeting_link && (
                <div className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-400 font-bold py-2.5 px-4 rounded-xl text-sm border border-dashed border-gray-200">
                  <Video className="w-4 h-4" /> Link Meeting Belum Tersedia
                </div>
              )}
              
              {!c.module_link && (
                <div className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-400 font-bold py-2.5 px-4 rounded-xl text-sm">
                  Modul Belum Tersedia
                </div>
              )}
            </div>
          </div>
        ))}
        
        {classes.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100 border-dashed">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-namsan-text">Belum Ada Kelas</h3>
            <p className="text-gray-500 mt-2">Anda belum terdaftar di kelas manapun. Silakan hubungi admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
