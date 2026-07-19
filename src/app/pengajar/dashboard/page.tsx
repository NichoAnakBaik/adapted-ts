import React from "react";
export const dynamic = 'force-dynamic';
import { BookOpen, CheckCircle2, Clock, Users, PenTool, MessageSquare, Award, Bot, GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTeacherDashboardStats } from "@/app/actions/pengajar";

export default async function PengajarDashboardPage() {
  const stats = await getTeacherDashboardStats();
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative bg-namsan-primary rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-xl border border-namsan-primary/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[80px] opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-20"></div>
        
        <div className="relative p-5 bg-white/30 backdrop-blur-md rounded-2xl shrink-0 border border-white/20 shadow-inner">
          <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-namsan-dark drop-shadow-md" strokeWidth={1.5} />
        </div>
        <div className="relative text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-namsan-dark mb-2 tracking-tight">안녕하세요, {stats.teacherName}!</h1>
          <p className="text-namsan-dark/80 text-sm md:text-base font-bold max-w-xl leading-relaxed">
            Panel Pengajar Namsan Korean Course. Kelola modul belajar, evaluasi, dan tingkatkan performa siswa Anda.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100/50">
            <CheckCircle2 className="w-7 h-7 text-namsan-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Kelas Aktif</p>
            <p className="text-3xl font-black text-gray-800">{stats.activeClassesCount}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 border border-green-100/50">
            <Users className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Siswa Diajar</p>
            <p className="text-3xl font-black text-gray-800">{stats.uniqueStudentsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
            <BookOpen className="w-7 h-7 text-namsan-blue" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Kuis & Ujian</p>
            <p className="text-3xl font-black text-gray-800">{stats.examsCount}</p>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Menu Cepat */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-namsan-primary/20 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-namsan-dark" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Akses Cepat Pengajar</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Link href="/pengajar/kelas" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Users className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Kelas Saya</h3>
              <p className="text-sm text-gray-500 font-medium">Kelola materi dan pertemuan kelas</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/pengajar/forum" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Forum Diskusi</h3>
              <p className="text-sm text-gray-500 font-medium">Jawab pertanyaan siswa secara interaktif</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/pengajar/kuis" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <PenTool className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Kuis & Evaluasi</h3>
              <p className="text-sm text-gray-500 font-medium">Buat latihan mingguan untuk siswa</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/pengajar/ujian" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Award className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Pemantauan Ujian</h3>
              <p className="text-sm text-gray-500 font-medium">Pantau hasil dan progres ujian siswa</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>

          </div>
        </div>

        {/* Rekomendasi AI */}
        <div className="bg-gray-900 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-namsan-primary/10 rounded-bl-full -z-10 blur-xl"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-namsan-primary/20 rounded-xl">
              <Bot className="w-5 h-5 text-namsan-primary" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Analitik Kelas</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl relative">
              <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-12 bg-namsan-primary rounded-r-md"></div>
              <div className="text-gray-300 text-sm leading-relaxed prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: stats.mlRecommendation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-namsan-primary">$1</strong>') }} />
            </div>
          </div>

          <Link href="/pengajar/analitik" className="mt-8 w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm group shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Bot className="w-5 h-5" />
            Buka Analitik Penuh
          </Link>
        </div>

      </div>
      
    </div>
  );
}
