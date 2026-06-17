import { prisma } from '@/lib/prisma';

export default async function PantauAbsensi() {
  const logAbsensi = await prisma.attendance.findMany({
    include: { student: true, class: true },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Pantau Absensi Global</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal / Waktu</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logAbsensi.map(absen => (
              <tr key={absen.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{absen.student.nama_lengkap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{absen.class.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(absen.date).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {absen.status === 'PRESENT' && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hadir</span>}
                  {absen.status === 'LATE' && <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Terlambat</span>}
                  {absen.status === 'ABSENT' && <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Alpa</span>}
                  {absen.status === 'EXCUSED' && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Izin</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
