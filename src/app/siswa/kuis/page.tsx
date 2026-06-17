import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function DaftarKuis() {
  const session = await getSession();
  const uid = session?.user_id;

  const kuisList = await prisma.kuis.findMany({
    where: {
      is_published: true,
      kelas: {
        enrollments: {
          some: {
            id_siswa: uid,
            status_aktif: true
          }
        }
      }
    },
    include: {
      kelas: true,
      nilai_kuis: {
        where: { id_siswa: uid }
      }
    },
    orderBy: { tanggal_dibuat: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Daftar Kuis</h1>
      <p className="text-gray-600">Evaluasi pemahamanmu melalui kuis dari kelas yang diikuti.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {kuisList.length > 0 ? (
          kuisList.map((kuis) => {
            const hasDone = kuis.nilai_kuis.length > 0;
            const nilai = hasDone ? kuis.nilai_kuis[0].skor : null;

            return (
              <div key={kuis.id_kuis} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition hover:shadow-md">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                      {kuis.kelas.nama_kelas}
                    </span>
                    {hasDone ? (
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Selesai (Skor: {nilai})
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Tersedia
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{kuis.judul_kuis}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{kuis.deskripsi}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Waktu: {kuis.waktu_menit} Menit
                  </div>
                </div>
                
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                  {hasDone ? (
                    <Link href={`/siswa/kuis/${kuis.id_kuis}/hasil`} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors">
                      Lihat Hasil
                    </Link>
                  ) : (
                    <Link href={`/siswa/kuis/${kuis.id_kuis}`} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors">
                      Mulai Kerjakan
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-8 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
            Belum ada kuis yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
