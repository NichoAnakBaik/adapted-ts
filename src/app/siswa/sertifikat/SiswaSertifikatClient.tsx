"use client";

import React from "react";
import { Award, Download, CheckCircle2, Lock } from "lucide-react";

export default function SiswaSertifikatClient({ certificates }: { certificates: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Award className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Sertifikat Level</h1>
            <p className="text-sm text-namsan-text-muted">Koleksi sertifikat kelulusan yang telah Anda raih.</p>
          </div>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const isPending = cert.status === 'PENDING';
            const availableDate = cert.available_at ? new Date(cert.available_at) : null;
            const isLocked = isPending && availableDate && availableDate > new Date();
            
            return (
              <div key={cert.id} className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center text-center relative overflow-hidden transition-colors ${isLocked ? 'border-gray-200 opacity-90' : 'border-gray-100 group hover:border-namsan-primary'}`}>
                <div className="absolute top-0 right-0 p-3">
                  {isLocked ? (
                    <Lock className="w-6 h-6 text-orange-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>
                
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-500'}`}>
                  <Award className="w-12 h-12" />
                </div>
                
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold mb-3 tracking-wider uppercase">
                  {cert.class.type}
                </span>
                
                <h3 className="text-lg font-bold text-namsan-text mb-1">{cert.class.name}</h3>
                <p className="text-sm text-gray-500 mb-6">Instruktur: {cert.class.teacher.nama_lengkap}</p>
                
                <div className="mt-auto w-full">
                  {isLocked ? (
                    <div className="w-full bg-orange-50 text-orange-600 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-orange-100">
                      <Lock className="w-4 h-4" /> 
                      <div className="flex flex-col items-center leading-tight">
                        <span>Sedang Diproses</span>
                        <span className="text-[10px] font-medium mt-0.5 opacity-80">
                          (Tersedia {availableDate ? availableDate.toLocaleDateString('id-ID') : 'H+3'})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <a 
                      href={cert.file_url || "#"} 
                      target="_blank" 
                      rel="noreferrer"
                      download={`${cert.class.name}_Certificate.pdf`}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Unduh Sertifikat
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Award className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-namsan-text mb-2">Belum Ada Sertifikat</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Anda belum memiliki sertifikat yang disetujui. Pastikan Anda menyelesaikan Ujian Akhir dengan nilai kelulusan agar sertifikat Anda dapat diterbitkan oleh Pengajar.
          </p>
          <a href="/siswa/ujian" className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-6 rounded-xl transition-colors">
            Lihat Ujian Akhir
          </a>
        </div>
      )}
    </div>
  );
}
