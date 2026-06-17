import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const totalSiswa = await prisma.user.count({ where: { role: 'siswa' } });
  const totalPengajar = await prisma.user.count({ where: { role: 'pengajar' } });
  const totalKelas = await prisma.kelas.count();
  const pendingSertif = await prisma.sertifikat.count({ where: { status_approve: false } });

  const usersTerbaru = await prisma.user.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    select: { id: true, username: true, nama_lengkap: true, role: true, created_at: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Siswa</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalSiswa}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Pengajar</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{totalPengajar}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Kelas</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{totalKelas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Sertifikat</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{pendingSertif}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Pengguna Baru</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {usersTerbaru.map((user) => (
            <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{user.nama_lengkap}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'pengajar' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
