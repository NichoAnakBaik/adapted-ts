import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-namsan-bg flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-namsan-text tracking-tight mb-6">
          Selamat Datang di <span className="text-namsan-primary">AdapteEd</span>
        </h1>
        <p className="text-xl text-namsan-text-muted mb-10">
          Platform Pembelajaran Bahasa Korea Interaktif dengan Teknologi AI.
        </p>
        <Link href="/login" className="bg-namsan-primary text-namsan-text font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-namsan-secondary transition-all">
          Masuk Sekarang
        </Link>
      </div>
    </div>
  );
}
