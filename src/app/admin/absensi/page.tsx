import { prisma } from '@/lib/prisma';

export default async function PantauAbsensi() {
  const logAbsensi = await prisma.absensiLogbook.findMany({
    include: { siswa: true },
    orderBy: { tanggal: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Pantau Absensi Global</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Waktu Masuk</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Durasi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logAbsensi.map(absen => (
              <tr key={absen.id_absen} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{absen.siswa.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {absen.tanggal ? new Date(absen.tanggal).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {absen.waktu_masuk ? new Date(absen.waktu_masuk).toLocaleTimeString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {absen.durasi_menit ? `${absen.durasi_menit} Menit` : 'Sedang Online'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
