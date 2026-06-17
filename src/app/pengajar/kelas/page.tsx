import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarKelasSiswa() {
  const session = await getSession();
  const kelasKu = await prisma.kelas.findMany({
     where: { id_pengajar: session?.user_id },
     include: { enrollments: { include: { siswa: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Daftar Siswa Per Kelas</h1>
      {kelasKu.map(kelas => (
        <div key={kelas.id_kelas} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
           <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">{kelas.nama_kelas}</h2>
           {kelas.enrollments.length > 0 ? (
             <ul className="divide-y divide-gray-100">
               {kelas.enrollments.map(en => (
                 <li key={en.id_enrollment} className="py-3 flex justify-between">
                    <span className="font-medium text-gray-900">{en.siswa.nama_lengkap} (@{en.siswa.username})</span>
                    <span className="text-sm text-gray-500">Tergabung sejak {new Date(en.tanggal_daftar).toLocaleDateString()}</span>
                 </li>
               ))}
             </ul>
           ) : (
             <p className="text-gray-500 italic">Belum ada siswa di kelas ini.</p>
           )}
        </div>
      ))}
    </div>
  );
}
