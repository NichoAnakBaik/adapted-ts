import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ManageModul() {
  const modulList = await prisma.materi.findMany({
    include: { kelas: true },
    orderBy: [{ kelas: { nama_kelas: 'asc' } }, { urutan: 'asc' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Modul Materi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Tambah Materi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Materi</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Urutan / Bab</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File PDF</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modulList.map(modul => (
              <tr key={modul.id_materi} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{modul.judul_materi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{modul.kelas?.nama_kelas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{modul.urutan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                  {modul.file_pdf ? 'Lihat PDF' : 'Tidak ada'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                  <Link href={`/admin/modul/edit/${modul.id_materi}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                  <button className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
