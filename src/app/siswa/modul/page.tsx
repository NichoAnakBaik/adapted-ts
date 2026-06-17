import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function ModulSiswa() {
  const session = await getSession();
  const uid = session?.user_id;

  const materiList = await prisma.materi.findMany({
    where: {
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
      kelas: true
    },
    orderBy: [
      { kelas: { nama_kelas: 'asc' } },
      { urutan: 'asc' }
    ]
  });

  // Group by Kelas
  const groupedMateri = materiList.reduce((acc: any, materi) => {
    const kelasName = materi.kelas.nama_kelas;
    if (!acc[kelasName]) acc[kelasName] = [];
    acc[kelasName].push(materi);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Modul Materi</h1>
      <p className="text-gray-600">Pelajari materi dari kelas yang kamu ikuti.</p>
      
      {Object.keys(groupedMateri).length > 0 ? (
        Object.keys(groupedMateri).map(kelasName => (
          <div key={kelasName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <h3 className="text-lg font-bold text-gray-900">Kelas: {kelasName}</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedMateri[kelasName].map((materi: any) => (
                  <div key={materi.id_materi} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Bab {materi.urutan}
                      </span>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {materi.judul_materi}
                    </h4>
                    {materi.file_pdf && (
                      <a href={`/uploads/${materi.file_pdf}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        Buka PDF <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
          Belum ada materi di kelas yang kamu ikuti.
        </div>
      )}
    </div>
  );
}
