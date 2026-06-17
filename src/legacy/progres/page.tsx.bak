import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarProgres() {
  const session = await getSession();
  
  const nilaiKuis = await prisma.nilaiKuis.findMany({
    where: { kuis: { kelas: { id_pengajar: session?.user_id } } },
    include: { siswa: true, kuis: { include: { kelas: true } } },
    orderBy: { waktu_selesai: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Progres Nilai Siswa</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kuis & Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Skor AI</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nilaiKuis.map(nilai => (
              <tr key={nilai.id_nilai} className="hover:bg-gray-50">
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{nilai.siswa.nama_lengkap}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {nilai.kuis.judul_kuis} <span className="block text-xs">{nilai.kuis.kelas.nama_kelas}</span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-lg font-black text-blue-600">{nilai.skor}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${nilai.status === 'Lulus' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {nilai.status}
                    </span>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
