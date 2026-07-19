import React from "react";
export const dynamic = 'force-dynamic';
import { Users, BookOpen, ShieldAlert, Award, Settings, ShieldCheck, ArrowRight, LayoutDashboard, Database } from "lucide-react";
import { getDashboardStats } from "@/app/actions/admin";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const { totalSiswa, totalPengajar, totalKelas } = await getDashboardStats();

  const recentLogs = await prisma.studentActivityLog.findMany({
    include: { student: { select: { nama_lengkap: true } } },
    orderBy: { created_at: 'desc' },
    take: 5
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-namsan-dark via-namsan-dark to-namsan-dark/90 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-xl border border-namsan-dark/20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-namsan-primary rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-[60px] opacity-10"></div>
        
        <div className="relative p-5 bg-white/10 backdrop-blur-md rounded-2xl shrink-0 border border-white/10 shadow-inner">
          <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-namsan-primary drop-shadow-md" strokeWidth={1.5} />
        </div>
        <div className="relative text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Selamat Datang, <span className="text-namsan-primary">Administrator</span></h1>
          <p className="text-gray-300 text-sm md:text-base font-medium max-w-xl leading-relaxed">
            Pusat Kontrol Utama Namsan Korean Course. Kelola seluruh ekosistem pengguna, kelas, dan pantau aktivitas sistem secara real-time.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100/50">
            <Users className="w-7 h-7 text-namsan-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Total Siswa</p>
            <p className="text-3xl font-black text-gray-800">{totalSiswa}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
            <Users className="w-7 h-7 text-namsan-blue" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Total Pengajar</p>
            <p className="text-3xl font-black text-gray-800">{totalPengajar}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-6 transition-all hover:-translate-y-1 duration-300">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 border border-green-100/50">
            <BookOpen className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Kelas Aktif</p>
            <p className="text-3xl font-black text-gray-800">{totalKelas}</p>
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
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Akses Cepat</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/users" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Users className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Manajemen Pengguna</h3>
              <p className="text-sm text-gray-500 font-medium">Kelola akses siswa dan pengajar</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/admin/kelas" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Manajemen Kelas</h3>
              <p className="text-sm text-gray-500 font-medium">Kelola modul dan jadwal</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/admin/sertifikat" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Award className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Sertifikasi & Level</h3>
              <p className="text-sm text-gray-500 font-medium">Penerbitan sertifikat kelulusan</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link href="/admin/ujian" className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-namsan-primary/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-namsan-primary/10 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-namsan-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100 group-hover:border-namsan-primary/20">
                <Settings className="w-6 h-6 text-gray-600 group-hover:text-namsan-dark transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Ujian Bahasa</h3>
              <p className="text-sm text-gray-500 font-medium">Kelola dan pantau seluruh ujian</p>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-namsan-primary absolute bottom-6 right-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-gray-900 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-namsan-primary/10 rounded-bl-full -z-10 blur-xl"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-namsan-primary/20 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-namsan-primary" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Aktivitas Terbaru</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentLogs.map((log, i) => {
              const meta = log.metadata ? JSON.parse(log.metadata) : {};
              return (
                <div key={log.id} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-namsan-primary before:rounded-full before:shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-gray-100 text-sm font-bold truncate pr-2">
                      {log.student?.nama_lengkap || "Siswa"}
                    </span>
                    <span className="text-gray-500 text-xs shrink-0 font-medium">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    <span className="text-namsan-primary font-medium">{log.action_type}</span>: {meta.targetName || log.action_type}
                  </p>
                  {i !== recentLogs.length - 1 && (
                    <div className="absolute left-1 top-5 bottom-[-16px] w-[2px] bg-gray-800 -z-10"></div>
                  )}
                </div>
              );
            })}
            {recentLogs.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8 font-medium">Belum ada aktivitas tercatat.</div>
            )}
          </div>

          <Link href="/admin/logs" className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm group">
            Lihat Semua Log
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
        </div>

      </div>
      
    </div>
  );
}
