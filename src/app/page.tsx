"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Brain, Layers, Award, ExternalLink, LogIn, X } from 'lucide-react';
import { loginAction } from "@/app/actions/auth";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setLoginError(result.error);
        setIsLoggingIn(false);
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err) {
      setLoginError("Terjadi kesalahan pada server.");
      setIsLoggingIn(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FCCC24] py-24 md:py-32 px-4 flex flex-col justify-center items-center text-center">
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Selamat Datang di <span className="text-gray-900">AdaptEd</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Platform Pembelajaran Bahasa Korea Adaptif Berbasis AI Case Study: Namsan Course.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold text-base md:text-lg px-8 md:px-10 py-3 md:py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Masuk Belajar <LogIn className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Mengapa Belajar di AdaptEd?
            </h2>
            <div className="bg-namsan-primary mx-auto rounded-full h-1.5 w-24"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-300 text-center group">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                <Brain className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Pengajar Berpengalaman</h4>
              <p className="text-gray-500 leading-relaxed">
                Pengajar ahli kami pernah tinggal di Korea Selatan dan sangat berpengalaman dalam mengajar bahasa Korea.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 transition-all duration-300 text-center group">
              <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                <Layers className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Kurikulum Standar TOPIK</h4>
              <p className="text-gray-500 leading-relaxed">
                Materi terstruktur yang diadaptasi dari Yonsei University & Korean Foundation, mencakup 5 kompetensi bahasa secara utuh.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-100 transition-all duration-300 text-center group">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Fleksibilitas Kelas</h4>
              <p className="text-gray-500 leading-relaxed">
                Tersedia kelas Offline dan Online dengan beragam pilihan jadwal Reguler maupun Privat sesuai kebutuhanmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="bg-gray-50 py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
              <div className="p-12 lg:p-20 bg-gradient-to-br from-red-50 via-red-50/50 to-white flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-red-100/50">
                <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-8 border-white transform hover:scale-105 transition-transform duration-500 text-center overflow-hidden relative">
                  <Image 
                    src="/namsan_logo.png" 
                    alt="Namsan Course Logo" 
                    fill
                    className="object-cover scale-150"
                  />
                </div>
              </div>
              <div className="p-12 lg:p-20 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Cari Tahu Lebih Banyak Tentang Namsan Korean Course
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  AdaptEd merupakan hasil pengembangan teknologi pembelajaran untuk membantu siswa Namsan Course belajar lebih efektif. Ingin tahu jadwal kelas offline atau program kursus lainnya?
                </p>
                <div>
                  <a 
                    href="https://namsankoreancourse.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    Kunjungi Website Resmi <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center bg-white border-t border-gray-100 relative z-10">
        <div className="container mx-auto px-4">
          <p className="text-gray-500 font-bold text-sm md:text-base">
            &copy; 2026 AdaptEd x Namsan Korean Course. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  Masuk ke <span className="text-red-500">AdaptEd</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Platform Pembelajaran Bahasa Korea Interaktif
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-namsan-primary focus:border-namsan-primary transition-all text-sm"
                    placeholder="Gunakan admin, pengajar, atau siswa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-namsan-primary focus:border-namsan-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                
                {loginError && (
                  <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</p>
                )}

                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
                >
                  {isLoggingIn ? "Memproses..." : "Masuk"}
                </button>
                
                <p className="text-xs text-center text-gray-400 mt-6 leading-relaxed">
                  Tip Dev: Login dengan username awalan <b className="text-gray-600">admin</b>, <b className="text-gray-600">pengajar</b>, atau <b className="text-gray-600">siswa</b>.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
