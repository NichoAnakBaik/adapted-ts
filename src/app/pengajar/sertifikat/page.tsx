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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sertifikatList.map((cert) => (
          <div key={cert.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-namsan-primary hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold ${
                cert.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                cert.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {cert.status === 'APPROVED' ? 'Approved' : 'Pending Admin'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                {cert.student.nama_lengkap.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <h3 className="font-bold text-base md:text-lg text-namsan-text truncate">{cert.student.nama_lengkap}</h3>
                <p className="text-xs text-gray-500 truncate">@{cert.student.username}</p>
              </div>
            </div>
            
            <div className="space-y-2 flex-1 mb-4">
              <div className="flex items-start gap-2 text-xs md:text-sm">
                <span className="font-medium text-gray-700 block w-16">Kelas:</span>
                <span className="text-gray-600 line-clamp-2">{cert.class?.name || '-'}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
              {cert.file_url ? (
                <a href={cert.file_url} target="_blank" rel="noreferrer" className="bg-namsan-soft hover:bg-namsan-primary text-namsan-dark font-bold py-2 md:py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm md:text-base transition-colors flex-1 justify-center">
                   Lihat Dokumen
                </a>
              ) : (
                <span className="text-sm text-gray-400 italic text-center flex-1">Belum diunggah</span>
              )}
            </div>
          </div>
        ))}
        {sertifikatList.length === 0 && (
          <div className="col-span-full p-8 md:p-12 text-center text-gray-500 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            Belum ada pengajuan sertifikat di kelas Anda.
          </div>
        )}
      </div>
    </div>
  );
}
