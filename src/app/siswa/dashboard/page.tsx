import React from "react";
export const dynamic = 'force-dynamic';
import { BookOpen, CheckCircle2, Clock, MapPin, Video, PenTool, MessageSquare, CalendarCheck, Award, Bot, ChevronRight, LayoutDashboard, ArrowRight } from "lucide-react";
import { getDashboardStats } from "@/app/actions/siswa";
import Link from "next/link";

export default async function SiswaDashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative bg-namsan-primary rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-xl border border-namsan-primary/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-[80px] opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-20"></div>
        
        <div className="relative p-5 bg-white/30 backdrop-blur-md rounded-2xl shrink-0 border border-white/20 shadow-inner">
          <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-namsan-dark drop-shadow-md" strokeWidth={1.5} />
        </div>
        <div className="relative text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-namsan-dark mb-2 tracking-tight">안녕하세요, {stats.nama_lengkap}!</h1>
          <p className="text-namsan-dark/80 text-sm md:text-base font-bold max-w-xl leading-relaxed">
            Panel Belajar Siswa Namsan Korean Course. Pantau progres akademik, pelajari modul, dan dapatkan rekomendasi AI personal untukmu.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-3 border border-green-100/50">
            <Clock className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 mb-1 tracking-widest uppercase">Durasi Belajar</p>
          <p className="text-3xl font-black text-gray-800">{stats.durationMinutes} <span className="text-lg font-bold text-gray-400">Min</span></p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 duration-300">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border ${stats.activeClass?.type === 'ONLINE' ? 'bg-purple-50 border-purple-100/50' : 'bg-blue-50 border-blue-100/50'}`}>
            {stats.activeClass?.type === 'ONLINE' ? (
              <Video className="w-7 h-7 text-purple-600" />
            ) : (
              <MapPin className="w-7 h-7 text-namsan-blue" />
            )}
          </div>
          <p className="text-xs font-bold text-gray-400 mb-1 tracking-widest uppercase">Metode Kelas Aktif</p>
          
          {stats.activeClass ? (
            stats.activeClass.type === 'ONLINE' ? (
              <div className="flex flex-col items-center mt-1">
                <p className="text-base font-bold text-gray-800 mb-1">Online (Daring)</p>
                {stats.activeClass.meeting_link ? (
                  <a href={stats.activeClass.meeting_link} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-600 hover:text-purple-800 underline flex items-center gap-1">
                    Buka Link Meeting <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">Belum tersedia</span>
                )}
              </div>
            ) : (
              <p className="text-base font-bold text-gray-800 mt-1">Offline (Tatap Muka)</p>
            )
          ) : (
            <p className="text-base font-bold text-gray-400 mt-1">Belum Terdaftar</p>
          )}
        </div>
      </div>

      {/* Language Mastery Bars */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-namsan-primary/20 rounded-xl">
            <Award className="w-5 h-5 text-namsan-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Tingkat Pemahaman Siswa (Mastery)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speaking */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-700">Berbicara (Speaking)</span>
              <span className="text-sm font-black text-namsan-primary">{stats.masteryLevels?.SPEAKING || 0}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-namsan-primary transition-all duration-1000 ease-out rounded-full" style={{ width: `${stats.masteryLevels?.SPEAKING || 0}%` }}></div>
            </div>
          </div>

          {/* Listening */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-700">Mendengar (Listening)</span>
              <span className="text-sm font-black text-namsan-blue">{stats.masteryLevels?.LISTENING || 0}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-namsan-blue transition-all duration-1000 ease-out rounded-full" style={{ width: `${stats.masteryLevels?.LISTENING || 0}%` }}></div>
            </div>
          </div>

          {/* Reading */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-700">Membaca (Reading)</span>
              <span className="text-sm font-black text-green-500">{stats.masteryLevels?.READING || 0}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000 ease-out rounded-full" style={{ width: `${stats.masteryLevels?.READING || 0}%` }}></div>
            </div>
          </div>

          {/* Writing */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-700">Menulis (Writing)</span>
              <span className="text-sm font-black text-purple-500">{stats.masteryLevels?.WRITING || 0}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000 ease-out rounded-full" style={{ width: `${stats.masteryLevels?.WRITING || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 mt-6">
        
        {/* Menu Pembelajaran */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-namsan-primary/20 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-namsan-dark" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Menu Pembelajaran</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Link href="/siswa/modul" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Modul Belajar</h3>
              <p className="text-sm text-gray-500 font-medium">Akses materi kelas interaktif</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/siswa/kuis" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <PenTool className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Kuis Kelas</h3>
              <p className="text-sm text-gray-500 font-medium">Uji kemampuan bahasa Koreamu</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/siswa/ujian" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <CheckCircle2 className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Ujian Akhir</h3>
              <p className="text-sm text-gray-500 font-medium">Kerjakan ujian kelulusan tingkat</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/siswa/forum" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Forum Kelas</h3>
              <p className="text-sm text-gray-500 font-medium">Diskusi materi dengan teman & pengajar</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/siswa/aktivitas" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Clock className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Riwayat Belajar</h3>
              <p className="text-sm text-gray-500 font-medium">Pantau aktivitas pembelajaran harian</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/siswa/absensi" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <CalendarCheck className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Absensi Kelas</h3>
              <p className="text-sm text-gray-500 font-medium">Cek rekap kehadiran kelasmu</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/siswa/sertifikat" className="sm:col-span-2 group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center shrink-0 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Award className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Sertifikat Level</h3>
                <p className="text-sm text-gray-500 font-medium">Klaim dan unduh sertifikat bukti pencapaian bahasa Koreamu</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary self-center transition-transform group-hover:translate-x-1 hidden sm:block mr-2" />
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
            <h2 className="text-xl font-bold text-white tracking-tight">Rekomendasi AI</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="bg-namsan-dark/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-300">Penguasaan Materi</span>
              <span className="text-lg font-black text-namsan-primary">{stats.masteryPercentage}%</span>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl relative">
              <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-12 bg-namsan-primary rounded-r-md"></div>
              <div className="text-gray-300 text-sm leading-relaxed prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: stats.mlRecommendation.replace(/\*\*(.*?)\*\*/g, '<strong class="text-namsan-primary">$1</strong>') }} />
            </div>
          </div>

          <Link href="/siswa/analitik" className="mt-8 w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm group shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Bot className="w-5 h-5" />
            Buka Analitik & AI
          </Link>
        </div>

      </div>
      
    </div>
  );
}
