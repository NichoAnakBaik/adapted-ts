import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export default async function KelolaSoal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const kuis = await prisma.exam.findUnique({ where: { id } });
  const soalList = await prisma.question.findMany({ where: { exam_id: id } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Soal AI</h1>
          <p className="text-gray-500 mt-1">Kuis: {kuis?.title}</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Tambah Soal Baru
        </button>
      </div>

      <div className="space-y-4">
        {soalList.map((soal, index) => (
          <div key={soal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start">
               <h3 className="font-bold text-gray-900">{index + 1}. {soal.question_text}</h3>
               <span className="bg-gray-100 px-2 py-1 text-xs rounded text-gray-600 uppercase tracking-widest">{soal.question_type}</span>
             </div>
             <div className="mt-4 p-4 bg-green-50 text-green-900 rounded-lg text-sm">
                <span className="font-bold mr-2">Kunci Jawaban:</span> 
                {soal.correct_answer || 'Pengecekan AI'}
             </div>
             <div className="mt-4 flex justify-end space-x-3">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit Soal</button>
                <button className="text-sm font-medium text-red-600 hover:text-red-800">Hapus</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
