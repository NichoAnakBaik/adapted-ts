import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarDashboard() {
  const session = await getSession();
  const uid = session?.user_id;

  const totalKelas = await prisma.kelas.count({ where: { id_pengajar: uid } });
  const totalKuis = await prisma.kuis.count({
    where: {
      kelas: {
        id_pengajar: uid
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Pengajar</h1>
      <p className="text-gray-600">Selamat datang, <span className="font-semibold text-blue-600">{session?.nama || 'Seonsaengnim'}</span>!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Kelas Aktif</p>
            <p className="mt-2 text-4xl font-bold text-blue-600">{totalKelas}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-full">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Kuis Dibuat</p>
            <p className="mt-2 text-4xl font-bold text-indigo-600">{totalKuis}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-full">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
