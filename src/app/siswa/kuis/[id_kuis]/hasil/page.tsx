import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HasilKuisPage({ params }: { params: Promise<{ id_kuis: string }> }) {
  const { id_kuis } = await params;
  const kuisId = parseInt(id_kuis);
  const session = await getSession();
  const uid = session?.user_id;

  const kuis = await prisma.kuis.findUnique({ where: { id_kuis: kuisId } });
  const nilai = await prisma.nilaiKuis.findFirst({
    where: { id_kuis: kuisId, id_siswa: uid }
  });

  if (!nilai || !kuis) {
    return redirect('/siswa/kuis');
  }

  const jawabanList = await prisma.jawabanSiswa.findMany({
    where: {
      id_siswa: uid,
      soal: { id_kuis: kuisId }
    },
    include: { soal: true }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Hasil Evaluasi AI: {kuis.judul_kuis}</h1>
        
        <div className="mt-8 flex justify-center space-x-12">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Skor Akhir</p>
            <p className={`mt-2 text-6xl font-black ${nilai.skor && nilai.skor >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {nilai.skor}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Status</p>
            <p className={`mt-2 text-4xl font-bold ${nilai.status === 'Lulus' ? 'text-green-600' : 'text-red-600'}`}>
              {nilai.status}
            </p>
          </div>
        </div>

        {nilai.status === 'Lulus' && (
          <div className="mt-8 p-4 bg-green-50 rounded-xl text-green-800 border border-green-200">
            🎉 Selamat! Anda telah lulus dan berhak mendapatkan sertifikat. Cek dashboard Anda.
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Analisis Jawaban</h2>
        {jawabanList.map((jawaban, index) => (
          <div key={jawaban.id_jawaban} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 w-3/4">
                <span className="text-gray-400 mr-2">{index + 1}.</span> {jawaban.soal.pertanyaan}
              </h3>
              <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                (jawaban.skor_ai || 0) >= 80 ? 'bg-green-100 text-green-700' :
                (jawaban.skor_ai || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                Skor: {jawaban.skor_ai}/100
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase">Jawaban Kamu</p>
                <p className="mt-2 text-gray-900 font-medium">{jawaban.jawaban}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs font-semibold text-blue-500 uppercase">Feedback AI</p>
                <p className="mt-2 text-blue-900">{jawaban.feedback_ai}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Link href="/siswa/kuis" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          Kembali ke Daftar Kuis
        </Link>
      </div>
    </div>
  );
}
