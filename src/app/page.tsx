import Link from 'next/link';
import Image from 'next/image';
import { Brain, Layers, Award, ExternalLink, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-gray-50 py-24 md:py-32 px-4 flex flex-col justify-center items-center text-center">
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Selamat Datang di <span className="text-red-500">AdaptEd</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Platform Pembelajaran Bahasa Korea Adaptif Berbasis AI Case Study: Namsan Course.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/login" 
              className="bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
            >
              Masuk Belajar <LogIn className="w-6 h-6" />
            </Link>
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
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Rekomendasi AI</h4>
              <p className="text-gray-500 leading-relaxed">
                Sistem kami menganalisis kelemahanmu dan memberikan materi yang paling kamu butuhkan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 transition-all duration-300 text-center group">
              <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                <Layers className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Kurikulum Level 1-5</h4>
              <p className="text-gray-500 leading-relaxed">
                Materi terstruktur dari Beginner hingga Master yang disusun secara sistematis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-100 transition-all duration-300 text-center group">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Sertifikat Resmi</h4>
              <p className="text-gray-500 leading-relaxed">
                Dapatkan sertifikat kelulusan yang di-approve langsung oleh administrator.
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
                    className="object-contain p-6"
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
      <footer className="mt-auto py-8 text-center bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-gray-500 font-bold text-sm md:text-base">
            &copy; 2026 AdaptEd x Namsan Korean Course. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
