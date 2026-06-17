import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';

export default async function ForumPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const diskusiList = await prisma.forumDiskusi.findMany({
    include: {
      penulis: true,
      kelas: true,
      forum_komentar: true
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <DashboardLayout user={session} role={session.role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forum Diskusi</h1>
            <p className="text-gray-600 mt-1">Diskusikan materi dan pertanyaan dengan pengajar dan siswa lain.</p>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
            + Buat Topik Baru
          </button>
        </div>
        
        <div className="space-y-4 mt-6">
          {diskusiList.length > 0 ? (
            diskusiList.map((diskusi) => (
              <div key={diskusi.id_diskusi} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl uppercase">
                      {diskusi.penulis.nama_lengkap.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{diskusi.judul}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">{diskusi.penulis.nama_lengkap}</span>
                        <span>&bull;</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{diskusi.kelas.nama_kelas}</span>
                        <span>&bull;</span>
                        <span>{new Date(diskusi.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mt-3 line-clamp-2">{diskusi.pesan}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xl font-bold text-gray-700">{diskusi.forum_komentar.length}</span>
                    <span className="text-xs font-medium text-gray-500">Balasan</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              Belum ada diskusi di forum ini. Jadilah yang pertama!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
