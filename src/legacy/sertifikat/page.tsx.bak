import { prisma } from '@/lib/prisma';

export default async function ManageSertifikat() {
  const sertifikatList = await prisma.sertifikat.findMany({
    include: { siswa: true, kelas: true },
    orderBy: { id_sertifikat: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Validasi Sertifikat</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sertifikat</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sertifikatList.map(cert => (
              <tr key={cert.id_sertifikat} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.siswa.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.kelas?.nama_kelas || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{cert.nama_sertifikat}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cert.status_approve ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                  {!cert.status_approve && (
                    <form action={`/api/sertifikat/approve/${cert.id_sertifikat}`} method="POST" className="inline">
                      <button className="text-green-600 hover:text-green-900">Approve</button>
                    </form>
                  )}
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
