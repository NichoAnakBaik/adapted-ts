"use client";

import React from "react";
import { LineChart, BrainCircuit, TrendingUp, TrendingDown, Target, BookOpen, Clock, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SiswaAnalitikClient({ data }: { data: any }) {
  const { attempts, recommendations } = data;

  // Calculate Average Score
  const totalScore = attempts.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0);
  const averageScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;
  
  // Calculate Progress Trend (last 2 attempts)
  let trendStr = "Stabil";
  let isUp = true;
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1].total_score || 0;
    const prev = attempts[attempts.length - 2].total_score || 0;
    if (last > prev) {
      trendStr = `Naik +${last - prev}`;
      isUp = true;
    } else if (last < prev) {
      trendStr = `Turun ${last - prev}`;
      isUp = false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-blue-50 rounded-xl shrink-0">
            <LineChart className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Analitik & AI</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Pantau grafik perkembangan dan rekomendasi belajar cerdas untuk Anda.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Left Col: Stats Overview */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs md:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Rata-rata Nilai</span>
            <span className={`text-4xl md:text-5xl font-black mb-2 ${averageScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
              {averageScore}
            </span>
            <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-gray-400">
              <Target className="w-4 h-4" /> Dari {attempts.length} Kuis/Ujian
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center justify-between sm:justify-start lg:justify-center gap-4">
            <div className="w-full sm:w-auto lg:w-full">
              <span className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-4 block uppercase tracking-wider">Tren Terakhir</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-3 w-full sm:w-auto lg:w-full">
              <div className={`p-2 md:p-3 rounded-full shrink-0 ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isUp ? <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> : <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <div className="text-left">
                <p className={`text-lg md:text-xl font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>{trendStr} Poin</p>
                <p className="text-xs text-gray-400">Dibandingkan tes sebelumnya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Recommendations & Patterns */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          
          {/* Learning Patterns Board */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base md:text-lg font-bold text-namsan-text">Pola Belajar Anda</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center sm:text-left">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Kehadiran</span>
                <span className="text-xl md:text-2xl font-black text-namsan-text">{data.patterns?.attendanceRate || 0}%</span>
              </div>
              <div className="p-3 md:p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center sm:text-left">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Durasi Modul</span>
                <span className="text-xl md:text-2xl font-black text-namsan-text">{data.patterns?.totalDurationHours || 0} Jam</span>
              </div>
              <div className="p-3 md:p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center sm:text-left">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Waktu Favorit</span>
                <span className="text-xs md:text-sm font-bold text-namsan-text block mt-1">{data.patterns?.timePreference || "Belum Terdeteksi"}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#151718] rounded-2xl p-4 md:p-8 shadow-lg relative overflow-hidden border border-white/5">
            {/* Glossy gradient accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-namsan-primary/10 rounded-bl-full -z-10 blur-3xl mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-full -z-10 blur-2xl mix-blend-screen"></div>
            
            <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-white/10 pb-4">
              <div className="p-3 bg-gradient-to-br from-namsan-primary to-namsan-secondary rounded-xl shadow-[0_0_15px_rgba(255,199,20,0.4)]">
                <Sparkles className="w-6 h-6 text-namsan-dark" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">AI Academic Report</h2>
                <p className="text-xs md:text-sm text-gray-400 font-medium">Dihasilkan secara real-time oleh Namsan Intelligence</p>
              </div>
            </div>

            {data.aiReport ? (
              <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-namsan-primary prose-ul:text-gray-300 prose-li:marker:text-namsan-primary">
                <ReactMarkdown>{data.aiReport}</ReactMarkdown>
              </div>
            ) : (
              <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5 border-dashed backdrop-blur-sm">
                <BrainCircuit className="w-12 h-12 text-gray-600 mb-4 animate-pulse" />
                <p className="text-gray-400 text-sm font-medium">Belum ada data yang cukup untuk dianalisis oleh AI. Ayo mulai kerjakan kuis!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Score History List */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mt-4 md:mt-6">
        <h3 className="text-base md:text-lg font-bold text-namsan-text mb-3 md:mb-4">Riwayat Nilai</h3>
        
        {attempts.length > 0 ? (
          <div className="space-y-3">
            {attempts.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-sm md:text-base text-namsan-text truncate">{att.exam.title}</span>
                    {att.exam.is_final && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">FINAL</span>}
                  </div>
                  <span className="text-xs text-gray-500 truncate block">{new Date(att.end_time || att.created_at).toLocaleString('id-ID')}</span>
                </div>
                <div className={`text-lg md:text-xl font-black shrink-0 ${att.total_score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                  {att.total_score}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs md:text-sm text-gray-400 text-center py-6">Belum ada riwayat kuis atau ujian.</p>
        )}
      </div>

    </div>
  );
}
