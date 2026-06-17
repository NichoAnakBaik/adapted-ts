import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect('/admin/users');

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">Edit Pengguna</h1>
      <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input type="text" defaultValue={user.nama_lengkap} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" defaultValue={user.username} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select defaultValue={user.role} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="siswa">Siswa</option>
            <option value="pengajar">Pengajar</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="pt-4 flex space-x-3">
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan Perubahan</button>
          <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Batal</button>
        </div>
      </form>
    </div>
  );
}
