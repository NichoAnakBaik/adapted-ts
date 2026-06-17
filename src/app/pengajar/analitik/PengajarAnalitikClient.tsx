"use client";

import React from "react";
import { LineChart, BrainCircuit, Users, AlertTriangle, TrendingDown, BookOpen, Clock } from "lucide-react";

export default function PengajarAnalitikClient({ data }: { data: any }) {
  const { attempts, recommendations, performanceList } = data;

  // Calculate overall class average score
  const totalScore = attempts.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0);
  const overallAverage = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

  // Find students who need attention (average < 65)
  const strugglingStudents = performanceList.filter((p: any) => p.average < 65);

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-indigo-50 rounded-xl shrink-0">
            <LineChart className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Analitik Siswa & AI</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Pantau keseluruhan performa kelas dan rekomendasi dari sistem ML.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 md:mb-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Rata-rata Nilai Kelas</p>
          <p className={`text-3xl md:text-4xl font-black ${overallAverage >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
            {overallAverage}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center mb-2 md:mb-3">
            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Rekomendasi AI Dikeluarkan</p>
          <p className="text-3xl md:text-4xl font-black text-namsan-text">{recommendations.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            {strugglingStudents.length > 0 && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
          </div>
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3 ${strugglingStudents.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            {strugglingStudents.length > 0 ? <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600" /> : <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Butuh Perhatian Khusus</p>
          <p className={`text-3xl md:text-4xl font-black ${strugglingStudents.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {strugglingStudents.length} <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide">Siswa</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* ML Recommendations Log */}
        <div className="bg-namsan-dark rounded-2xl p-4 md:p-6 shadow-lg flex flex-col h-80 md:h-96">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 shrink-0">
            <div className="p-2 bg-white/10 rounded-lg">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-namsan-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">Log Intervensi AI</h2>
          </div>

          <div className="overflow-y-auto pr-2 space-y-3 md:space-y-4 flex-1">
            {recommendations.length > 0 ? (
              recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-white/5 p-3 md:p-4 rounded-xl border border-white/10 relative">
                  <span className="absolute top-3 md:top-4 right-3 md:right-4 text-[10px] md:text-xs font-bold text-white/50">{new Date(rec.created_at).toLocaleDateString('id-ID')}</span>
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-2 pr-16 md:pr-20">
                    <span className="bg-namsan-primary text-namsan-dark text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {rec.recommendation_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-gray-300 truncate max-w-full">untuk {rec.student.nama_lengkap}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{rec.recommendation_text}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" />
                <p className="text-xs md:text-sm">Belum ada rekomendasi AI yang diterbitkan untuk kelas-kelas Anda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Student Performance Ranking */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col h-80 md:h-96 mt-4 lg:mt-0">
          <h2 className="text-lg md:text-xl font-bold text-namsan-text mb-4 md:mb-6 shrink-0">Peringkat Rata-rata Siswa</h2>
          
          <div className="overflow-y-auto pr-2 flex-1">
            {performanceList.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {performanceList.map((stat: any, index: number) => (
                  <div key={stat.id} className={`flex items-center justify-between p-3 md:p-4 rounded-xl border ${stat.average < 65 ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-2">
                      <div className={`w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs ${stat.average < 65 ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 shadow-sm'}`}>
                        #{index + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm md:text-base text-namsan-text truncate">{stat.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{stat.class} • {stat.attemptsCount} Ujian</p>
                      </div>
                    </div>
                    <div className={`text-xl md:text-2xl font-black shrink-0 ${stat.average < 65 ? 'text-red-500' : stat.average >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                      {stat.average}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Users className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20" />
                <p className="text-xs md:text-sm">Belum ada data nilai siswa.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
