import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function PengajarSertifikat() {
  const session = await getSession();
  
  const sertifikatList = await prisma.sertifikat.findMany({
    where: { kelas: { id_pengajar: session?.user_id } },
    include: { siswa: true, kelas: true },
    orderBy: { tanggal_keluar: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold text-gray-900">Sertifikat Kelulusan Siswa</h1>
         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
           + Upload Sertifikat Manual
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sertifikat</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sertifikatList.map(cert => (
              <tr key={cert.id_sertifikat} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{cert.siswa.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.kelas?.nama_kelas || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{cert.nama_sertifikat}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   {cert.status_approve ? (
                     <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs">Approved</span>
                   ) : (
                     <span className="text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded text-xs">Pending Admin</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
