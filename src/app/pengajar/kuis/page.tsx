import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function PengajarKelolaKuis() {
  const session = await getSession();
  
  const kuisList = await prisma.kuis.findMany({
    where: {
      kelas: { id_pengajar: session?.user_id }
    },
    include: {
      kelas: true,
      soal: true
    },
    orderBy: { tanggal_dibuat: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Kuis AI</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Buat Kuis Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kuisList.map(kuis => (
          <div key={kuis.id_kuis} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-xl font-bold text-gray-900">{kuis.judul_kuis}</h3>
               <span className={`px-2 py-1 text-xs font-bold rounded-full ${kuis.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                 {kuis.is_published ? 'Published' : 'Draft'}
               </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">{kuis.kelas.nama_kelas}</p>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
               <span>{kuis.soal.length} Soal AI</span>
               <span>{kuis.waktu_menit} Menit</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between space-x-2 text-sm font-medium">
              <Link href={`/pengajar/kuis/${kuis.id_kuis}/soal`} className="text-center w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                Kelola Soal
              </Link>
              <button className="text-center w-full py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
