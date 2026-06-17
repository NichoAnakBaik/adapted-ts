import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function SiswaDashboard() {
  const session = await getSession();
  const uid = session?.user_id;

  const totalKelas = await prisma.enrollment.count({
    where: { id_siswa: uid, status_aktif: true }
  });

  const totalKuisResult = await prisma.kuis.count({
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
    }
  });

  const daftarKelas = await prisma.enrollment.findMany({
    where: { id_siswa: uid, status_aktif: true },
    include: {
      kelas: {
        include: {
          pengajar: true
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
        <p className="text-gray-600 mt-2">Selamat belajar, <span className="font-semibold text-blue-600">{session?.nama || 'Haksaeng'}</span>!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between transform transition hover:scale-[1.02]">
          <div>
            <p className="text-blue-100 font-medium">Kelas Diikuti</p>
            <p className="mt-1 text-5xl font-extrabold">{totalKelas}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between transform transition hover:scale-[1.02]">
          <div>
            <p className="text-indigo-100 font-medium">Kuis Tersedia</p>
            <p className="mt-1 text-5xl font-extrabold">{totalKuisResult}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Daftar Kelas Anda</h3>
        </div>
        {daftarKelas.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {daftarKelas.map((enroll) => (
              <li key={enroll.id_enrollment} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                      {enroll.kelas.nama_kelas.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{enroll.kelas.nama_kelas}</p>
                      <p className="text-sm text-gray-500 mt-1">Pengajar: {enroll.kelas.pengajar?.nama_lengkap || 'Belum ada'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Aktif
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Anda belum terdaftar di kelas manapun.
          </div>
        )}
      </div>
    </div>
  );
}
