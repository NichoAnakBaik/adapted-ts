import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 tracking-tight">AdaptEd.</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors">
                Masuk
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all transform hover:scale-105">
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Pintar Berbahasa Korea <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Dengan Evaluasi AI
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Platform pembelajaran bahasa adaptif yang mendengarkan, membaca, dan menganalisis kemampuan Anda menggunakan teknologi Artificial Intelligence modern.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1">
              Mulai Belajar Gratis
            </Link>
            <Link href="/login" className="bg-white text-blue-600 border border-gray-200 font-semibold px-8 py-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
