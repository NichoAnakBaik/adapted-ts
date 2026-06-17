import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function EditKelas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const kelas = await prisma.class.findUnique({ where: { id } });
  if (!kelas) redirect('/admin/kelas');

  const pengajarList = await prisma.user.findMany({ where: { role: 'PENGAJAR' } });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">Edit Kelas</h1>
      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Kelas</label>
          <input type="text" defaultValue={kelas.name} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pengajar</label>
          <select defaultValue={kelas.teacher_id || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="">-- Pilih Pengajar --</option>
            {pengajarList.map(p => (
              <option key={p.id} value={p.id}>{p.nama_lengkap}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipe Kelas</label>
          <input type="text" defaultValue={kelas.type || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jadwal</label>
          <input type="text" defaultValue={kelas.schedule || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="pt-4 flex space-x-3">
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan Perubahan</button>
          <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Batal</button>
        </div>
      </form>
    </div>
  );
}
