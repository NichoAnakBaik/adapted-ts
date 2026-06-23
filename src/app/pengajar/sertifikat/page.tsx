import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PengajarSertifikat() {
  const session = await getSession();
  if (!session) redirect("/?login=true");
  
  const sertifikatList = await prisma.certificate.findMany({
    where: { class: { teacher_id: session.user.id } },
    include: { student: true, class: true },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sertifikat Kelulusan Siswa</h1>
          <p className="text-sm text-gray-500">Daftar sertifikat kelulusan siswa di kelas Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full min-w-[600px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kelas</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">File</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sertifikatList.map(cert => (
              <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{cert.student.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.class?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-namsan-primary hover:underline">Lihat Sertifikat</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   {cert.status === 'APPROVED' ? (
                     <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-xs">Approved</span>
                   ) : (
                     <span className="text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded-full text-xs">Pending Admin</span>
                   )}
                </td>
              </tr>
            ))}
            {sertifikatList.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada sertifikat kelulusan.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
