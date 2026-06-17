import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function PantauForumDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diskusiId = parseInt(id);

  const diskusi = await prisma.forumDiskusi.findUnique({
    where: { id_diskusi: diskusiId },
    include: {
      penulis: true,
      kelas: true,
      forum_komentar: true
    }
  });

  if (!diskusi) redirect('/admin/forum');

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Detail Diskusi</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-2xl font-bold text-gray-900">{diskusi.judul}</h2>
         <p className="text-sm text-gray-500 mt-2">Oleh: {diskusi.penulis.nama_lengkap} di {diskusi.kelas.nama_kelas}</p>
         <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-800">
            {diskusi.pesan}
         </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-xl font-bold text-gray-900">Komentar Balasan ({diskusi.forum_komentar.length})</h3>
         {diskusi.forum_komentar.map(komentar => (
           <div key={komentar.id_komentar} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
             <p className="text-gray-800">{komentar.komentar}</p>
             <button className="text-red-600 text-sm hover:text-red-800">Hapus Balasan</button>
           </div>
         ))}
      </div>
    </div>
  );
}
