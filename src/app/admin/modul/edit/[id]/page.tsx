import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function EditModul({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const modulId = parseInt(id);

  const modul = await prisma.materi.findUnique({ where: { id_materi: modulId } });
  if (!modul) redirect('/admin/modul');

  const kelasiList = await prisma.kelas.findMany();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">Edit Modul Materi</h1>
      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul Materi</label>
          <input type="text" defaultValue={modul.judul_materi || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kelas</label>
          <select defaultValue={modul.id_kelas} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            {kelasiList.map(k => (
              <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Urutan (Bab)</label>
          <input type="number" defaultValue={modul.urutan || 1} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="pt-4 flex space-x-3">
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan Perubahan</button>
          <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Batal</button>
        </div>
      </form>
    </div>
  );
}
