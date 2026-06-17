import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarModul() {
  const session = await getSession();
  
  const modulList = await prisma.materi.findMany({
    where: { kelas: { id_pengajar: session?.user_id } },
    include: { kelas: true },
    orderBy: [{ kelas: { nama_kelas: 'asc' } }, { urutan: 'asc' }]
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Modul Kelas Anda</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {modulList.map(modul => (
            <div key={modul.id_materi} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">{modul.kelas.nama_kelas}</span>
               <h3 className="text-lg font-bold text-gray-900 mt-2">{modul.judul_materi}</h3>
               <p className="text-sm text-gray-500 mt-1 mb-4">Bab {modul.urutan}</p>
               {modul.file_pdf && (
                 <a href={`/uploads/${modul.file_pdf}`} className="text-indigo-600 text-sm font-medium hover:underline">Lihat PDF</a>
               )}
            </div>
         ))}
      </div>
    </div>
  );
}
