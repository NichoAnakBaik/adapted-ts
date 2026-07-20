"use client";

import React from "react";
import { LineChart, BrainCircuit, Users, AlertTriangle, TrendingDown, BookOpen, Clock, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
        
        {/* AI Pedagogical Report */}
        <div className="bg-[#151718] rounded-2xl p-4 md:p-6 shadow-lg flex flex-col h-80 md:h-96 relative overflow-hidden border border-white/5">
          {/* Glossy gradient accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-namsan-primary/10 rounded-bl-full -z-10 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-full -z-10 blur-2xl mix-blend-screen"></div>

          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 shrink-0 border-b border-white/10 pb-4">
            <div className="p-2 md:p-3 bg-gradient-to-br from-namsan-primary to-namsan-secondary rounded-xl shadow-[0_0_15px_rgba(255,199,20,0.4)]">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-namsan-dark" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">AI Pedagogical Report</h2>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium">Analisis Real-time Kelas</p>
            </div>
          </div>

          <div className="overflow-y-auto pr-2 space-y-3 md:space-y-4 flex-1">
            {data.aiReport ? (
              <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-namsan-primary prose-ul:text-gray-300 prose-li:marker:text-namsan-primary">
                <ReactMarkdown>{data.aiReport}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 opacity-20 animate-pulse" />
                <p className="text-xs md:text-sm">Belum ada data evaluasi kelas yang cukup untuk dianalisis oleh AI.</p>
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
