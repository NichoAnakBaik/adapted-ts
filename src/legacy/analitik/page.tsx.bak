import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarAnalitik() {
  const session = await getSession();
  
  const totalLulus = await prisma.nilaiKuis.count({
    where: { status: 'Lulus', kuis: { kelas: { id_pengajar: session?.user_id } } }
  });

  const totalGagal = await prisma.nilaiKuis.count({
    where: { status: 'Gagal', kuis: { kelas: { id_pengajar: session?.user_id } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analisis Kinerja Siswa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-xl font-bold opacity-90">Siswa Lulus Ujian</h3>
            <p className="text-6xl font-black mt-4">{totalLulus}</p>
         </div>
         <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-xl font-bold opacity-90">Siswa Perlu Bimbingan</h3>
            <p className="text-6xl font-black mt-4">{totalGagal}</p>
         </div>
      </div>
    </div>
  );
}
