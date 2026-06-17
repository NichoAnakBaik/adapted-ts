import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminForum() {
  const diskusiList = await prisma.forumDiskusi.findMany({
    include: { penulis: true, kelas: true, forum_komentar: true },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Pantau Forum Global</h1>
      <div className="grid grid-cols-1 gap-6">
         {diskusiList.map(diskusi => (
            <div key={diskusi.id_diskusi} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg text-gray-900">{diskusi.judul}</h3>
                  <p className="text-sm text-gray-500 mt-1">Oleh: {diskusi.penulis.nama_lengkap} di Kelas {diskusi.kelas.nama_kelas}</p>
                  <p className="text-sm text-gray-700 mt-2">{diskusi.pesan}</p>
               </div>
               <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">{diskusi.forum_komentar.length} Balasan</span>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus Thread</button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
