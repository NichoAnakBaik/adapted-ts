import React from "react";
import { BookOpen, CheckCircle2, Clock, MapPin, Video, PenTool, MessageSquare, CalendarCheck, Award, Bot, ChevronRight } from "lucide-react";
import { getDashboardStats } from "@/app/actions/siswa";

export default async function SiswaDashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-namsan-primary rounded-2xl p-8 flex items-center gap-6 shadow-sm">
        <div className="p-4 bg-white/20 rounded-xl shrink-0">
          <BookOpen className="w-12 h-12 text-namsan-dark" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">안녕하세요, {stats.nama_lengkap}!</h1>
          <p className="text-namsan-text/80 font-medium">
            Panel Belajar Siswa Namsan Korean Course. Pantau progres akademik dan rekomendasi AI kamu.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-namsan-primary" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider">MODUL LULUS</p>
          <p className="text-2xl font-bold text-namsan-text">{stats.completedModules}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider">DURASI BELAJAR</p>
          <p className="text-xl font-bold text-namsan-text">{stats.durationMinutes} Min</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${stats.activeClass?.type === 'ONLINE' ? 'bg-purple-50' : 'bg-blue-50'}`}>
            {stats.activeClass?.type === 'ONLINE' ? (
              <Video className="w-6 h-6 text-purple-600" />
            ) : (
              <MapPin className="w-6 h-6 text-namsan-blue" />
            )}
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Metode Kelas Aktif</p>
          
          {stats.activeClass ? (
            stats.activeClass.type === 'ONLINE' ? (
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-namsan-text mb-1">Online (Daring)</p>
                {stats.activeClass.meeting_link ? (
                  <a href={stats.activeClass.meeting_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-purple-600 hover:text-purple-800 underline">Buka Link Meeting</a>
                ) : (
                  <span className="text-xs text-gray-400">Link belum tersedia</span>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-namsan-text">Offline (Tatap Muka di Tempat)</p>
            )
          ) : (
            <p className="text-sm font-medium text-gray-400">Belum terdaftar di kelas</p>
          )}
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Menu Pembelajaran */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-namsan-text mb-4">Menu Pembelajaran</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <a href="/siswa/modul" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <BookOpen className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Modul Belajar</span>
            </a>
            
            <a href="/siswa/kuis" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <PenTool className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Kuis Kelas</span>
            </a>
            
            <a href="/siswa/ujian" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <CheckCircle2 className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Ujian Akhir</span>
            </a>
            
            <a href="/siswa/forum" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <MessageSquare className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Forum Kelas</span>
            </a>
            
            <a href="/siswa/aktivitas" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Clock className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Riwayat Belajar</span>
            </a>

            <a href="/siswa/sertifikat" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Award className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Sertifikat Level</span>
            </a>

          </div>
        </div>

        {/* Rekomendasi AI */}
        <div className="bg-namsan-dark rounded-2xl p-6 flex flex-col shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="w-8 h-8 text-namsan-primary" />
            <h2 className="text-xl font-bold text-namsan-primary">Rekomendasi AI</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <p className="text-gray-300 text-sm leading-relaxed">
              Tingkat penguasaan materi bahasa Korea kamu saat ini menyentuh angka <strong>- %</strong>.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sistem mendeteksi adanya kelemahan minor pada pola kalimat level ini. Direkomendasikan melakukan re-evaluasi kuis.
            </p>
          </div>

          <a href="/siswa/analitik" className="mt-8 w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Bot className="w-5 h-5" />
            Buka Analitik & AI
          </a>
        </div>

      </div>
      
    </div>
  );
}
