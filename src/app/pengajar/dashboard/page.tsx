import React from "react";
import { BookOpen, CheckCircle2, Clock, Users, PenTool, MessageSquare, Award, Bot, GraduationCap } from "lucide-react";

export default function PengajarDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-namsan-primary rounded-2xl p-8 flex items-center gap-6 shadow-sm">
        <div className="p-4 bg-white/20 rounded-xl shrink-0">
          <GraduationCap className="w-12 h-12 text-namsan-dark" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">안녕하세요, Seonsaengnim!</h1>
          <p className="text-namsan-text/80 font-medium">
            Panel Pengajar Namsan Korean Course. Kelola kelas, modul, dan pantau progres belajar siswa Anda.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-namsan-primary" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Kelas Aktif</p>
          <p className="text-3xl font-bold text-namsan-text">2</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Siswa Diajar</p>
          <p className="text-3xl font-bold text-namsan-text">45</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-namsan-blue" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Modul Dibuat</p>
          <p className="text-3xl font-bold text-namsan-text">12</p>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Menu Cepat */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-namsan-text mb-4">Akses Cepat Pengajar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <a href="/pengajar/kelas" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Users className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Kelas Saya</span>
            </a>
            
            <a href="/pengajar/modul" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <BookOpen className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Manajemen Modul</span>
            </a>
            
            <a href="/pengajar/kuis" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <PenTool className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Kuis & Evaluasi</span>
            </a>
            
            <a href="/pengajar/forum" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <MessageSquare className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Forum Kelas</span>
            </a>

          </div>
        </div>

        {/* Rekomendasi AI */}
        <div className="bg-namsan-dark rounded-2xl p-6 flex flex-col shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="w-8 h-8 text-namsan-primary" />
            <h2 className="text-xl font-bold text-namsan-primary">AI Analitik Kelas</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <p className="text-gray-300 text-sm leading-relaxed">
              Berdasarkan hasil kuis terakhir, <strong className="text-namsan-primary">40% siswa</strong> di kelas Beginner A1 masih kesulitan pada bagian <i>Listening</i>.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI merekomendasikan Anda untuk mengunggah modul audio tambahan pada pertemuan berikutnya.
            </p>
          </div>

          <a href="/pengajar/analitik" className="mt-8 w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Bot className="w-5 h-5" />
            Buka Analitik Kelas
          </a>
        </div>

      </div>
      
    </div>
  );
}
