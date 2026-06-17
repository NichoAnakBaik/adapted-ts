import React from "react";
import { Users, BookOpen, ShieldAlert, Award, Database, Settings, ShieldCheck, BarChart4 } from "lucide-react";
import { getDashboardStats } from "@/app/actions/admin";

export default async function AdminDashboardPage() {
  const { totalSiswa, totalPengajar, totalKelas } = await getDashboardStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-namsan-primary rounded-2xl p-8 flex items-center gap-6 shadow-sm">
        <div className="p-4 bg-white/20 rounded-xl shrink-0">
          <ShieldCheck className="w-12 h-12 text-namsan-dark" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-namsan-text mb-1">Selamat Datang, Administrator!</h1>
          <p className="text-namsan-text/80 font-medium">
            Pusat Kontrol Utama AdapteEd. Kelola pengguna, kelas, dan pantau aktivitas sistem.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-namsan-primary" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Total Siswa Aktif</p>
          <p className="text-3xl font-bold text-namsan-text">{totalSiswa}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-namsan-blue" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Total Pengajar</p>
          <p className="text-3xl font-bold text-namsan-text">{totalPengajar}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-bold text-namsan-text-muted mb-1 tracking-wider uppercase">Total Kelas Tersedia</p>
          <p className="text-3xl font-bold text-namsan-text">{totalKelas}</p>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Menu Cepat */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-namsan-text mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <a href="/admin/users" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Users className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Manajemen Pengguna</span>
            </a>
            
            <a href="/admin/kelas" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <BookOpen className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Manajemen Kelas</span>
            </a>
            
            <a href="/admin/sertifikat" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Award className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Sertifikasi & Leveling</span>
            </a>
            
            <a href="/admin/settings" className="bg-white rounded-xl p-5 border border-namsan-primary/30 flex items-center justify-center gap-3 hover:border-namsan-primary hover:shadow-md transition-all group">
              <Settings className="w-6 h-6 text-namsan-text group-hover:text-namsan-primary transition-colors" />
              <span className="font-bold text-namsan-text">Pengaturan Sistem</span>
            </a>

          </div>
        </div>

        {/* System Logs */}
        <div className="bg-namsan-dark rounded-2xl p-6 flex flex-col shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-namsan-primary" />
            <h2 className="text-xl font-bold text-namsan-primary">Status Database</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-sm">Server Koneksi</span>
              <span className="text-green-400 text-sm font-bold">Stabil (12ms)</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-sm">Penggunaan Storage</span>
              <span className="text-yellow-400 text-sm font-bold">45% (Aman)</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-sm">Last Backup</span>
              <span className="text-gray-200 text-sm font-bold">Hari ini, 03:00 AM</span>
            </div>
          </div>

          <a href="/admin/logs" className="mt-8 w-full bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <ShieldAlert className="w-5 h-5" />
            Cek Keamanan Log
          </a>
        </div>

      </div>
      
    </div>
  );
}
