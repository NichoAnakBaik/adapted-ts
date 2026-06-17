import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export default async function AbsensiSiswaPage() {
  const session = await getSession();
  const uid = session?.user_id;

  const logAbsensi = await prisma.absensiLogbook.findMany({
    where: { id_siswa: uid },
    orderBy: { tanggal: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Riwayat Absensi</h1>
      <p className="text-gray-600">Catatan waktu belajarmu di platform AdaptEd.</p>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Masuk</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Keluar</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durasi Belajar</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logAbsensi.length > 0 ? (
                logAbsensi.map((absen) => (
                  <tr key={absen.id_absen} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {absen.tanggal ? new Date(absen.tanggal).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {absen.waktu_masuk ? new Date(absen.waktu_masuk).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {absen.waktu_keluar ? new Date(absen.waktu_keluar).toLocaleTimeString() : 'Belum Logout'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {absen.durasi_menit !== null ? `${absen.durasi_menit} Menit` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {absen.waktu_keluar ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Selesai</span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Sedang Online</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada riwayat absensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
