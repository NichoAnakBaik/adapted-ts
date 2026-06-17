import { prisma } from '@/lib/prisma';

export default async function ManageEnrollment() {
  const enrollments = await prisma.enrollment.findMany({
    include: { siswa: true, kelas: true },
    orderBy: { tanggal_daftar: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Kelola Pendaftaran Kelas (Enrollment)</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <p className="text-gray-500 mb-4">Halaman ini digunakan untuk melihat dan mengelola pendaftaran siswa pada setiap kelas.</p>
        <ul className="divide-y divide-gray-200">
          {enrollments.map(en => (
             <li key={en.id_enrollment} className="py-4 flex justify-between items-center">
                <div>
                   <p className="font-bold text-gray-900">{en.siswa.nama_lengkap}</p>
                   <p className="text-sm text-gray-500">Mendaftar di kelas: {en.kelas.nama_kelas}</p>
                </div>
                <div className="flex space-x-3 items-center">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${en.status_aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {en.status_aktif ? 'Aktif' : 'Non-Aktif'}
                   </span>
                   <button className="text-sm text-blue-600 font-medium">Ubah Status</button>
                </div>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
