"use client";

import React from "react";
import { LineChart, BrainCircuit, TrendingUp, TrendingDown, Target, BookOpen, Clock } from "lucide-react";

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
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <LineChart className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-namsan-text">Analitik & AI</h1>
            <p className="text-sm text-namsan-text-muted">Pantau grafik perkembangan dan rekomendasi belajar cerdas untuk Anda.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Stats Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Rata-rata Nilai</span>
            <span className={`text-5xl font-black mb-2 ${averageScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
              {averageScore}
            </span>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-400">
              <Target className="w-4 h-4" /> Dari {attempts.length} Kuis/Ujian
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-gray-500 mb-4 block uppercase tracking-wider">Tren Terakhir</span>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isUp ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <p className={`text-xl font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>{trendStr} Poin</p>
                <p className="text-xs text-gray-400">Dibandingkan tes sebelumnya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Recommendations & Patterns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Learning Patterns Board */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-namsan-text">Pola Belajar Anda</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Kehadiran</span>
                <span className="text-2xl font-black text-namsan-text">{data.patterns?.attendanceRate || 0}%</span>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Durasi Modul</span>
                <span className="text-2xl font-black text-namsan-text">{data.patterns?.totalDurationHours || 0} Jam</span>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="text-xs font-bold text-indigo-500 mb-1 block uppercase tracking-wider">Waktu Favorit</span>
                <span className="text-sm font-bold text-namsan-text block mt-1">{data.patterns?.timePreference || "Belum Terdeteksi"}</span>
              </div>
            </div>
          </div>
          <div className="bg-namsan-dark rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full -z-10"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-namsan-primary/20 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-namsan-primary" />
              </div>
              <h2 className="text-xl font-bold text-white">Rekomendasi AI</h2>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec: any) => (
                  <div key={rec.id} className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-start gap-3">
                    <div className="mt-0.5 text-namsan-primary">
                      {rec.recommendation_type === 'MODULE_SUGGESTION' ? <BookOpen className="w-5 h-5" /> : 
                       rec.recommendation_type === 'PACE_WARNING' ? <Clock className="w-5 h-5" /> : 
                       <BrainCircuit className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-namsan-primary mb-1 block uppercase tracking-wider">{rec.recommendation_type.replace('_', ' ')}</span>
                      <p className="text-sm text-gray-300 leading-relaxed">{rec.recommendation_text}</p>
                      <span className="text-xs text-gray-500 mt-2 block">{new Date(rec.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white/5 rounded-xl border border-white/5 border-dashed">
                <BrainCircuit className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Belum ada rekomendasi AI saat ini. Terus kerjakan modul dan kuis agar AI dapat menganalisis pola belajar Anda.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Score History List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
        <h3 className="text-lg font-bold text-namsan-text mb-4">Riwayat Nilai</h3>
        
        {attempts.length > 0 ? (
          <div className="space-y-3">
            {attempts.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-namsan-text">{att.exam.title}</span>
                    {att.exam.is_final && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">FINAL</span>}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(att.end_time || att.created_at).toLocaleString('id-ID')}</span>
                </div>
                <div className={`text-xl font-black ${att.total_score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                  {att.total_score}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">Belum ada riwayat kuis atau ujian.</p>
        )}
      </div>

    </div>
  );
}
