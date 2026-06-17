import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ManageKelas() {
  const kelasiList = await prisma.kelas.findMany({
    include: { pengajar: true },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Kelas</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Tambah Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kelasiList.map(kelas => (
          <div key={kelas.id_kelas} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition hover:shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{kelas.nama_kelas}</h3>
            <p className="text-sm text-gray-500 mb-4 flex-grow">Pengajar: {kelas.pengajar?.nama_lengkap || 'Belum Ada'}</p>
            
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              <span className="bg-gray-100 px-2 py-1 rounded">{kelas.level_bahasa || 'Umum'}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{kelas.tipe_kelas || 'Offline'}</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">Dibuat: {new Date(kelas.created_at).toLocaleDateString()}</span>
              <div className="space-x-2 text-sm font-medium">
                <Link href={`/admin/kelas/edit/${kelas.id_kelas}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                <button className="text-red-600 hover:text-red-900">Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
