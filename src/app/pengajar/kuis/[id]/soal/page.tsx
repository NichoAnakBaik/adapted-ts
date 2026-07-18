import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import KelolaSoalClient from './KelolaSoalClient';
import { redirect } from 'next/navigation';

export default async function KelolaSoal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.user.role !== "PENGAJAR") redirect("/?login=true");

  const kuis = await prisma.exam.findUnique({ 
    where: { id },
    include: { class: true } 
  });
  
  if (!kuis || kuis.class?.teacher_id !== session.user.id) {
    return <div className="p-10 text-center text-red-500">Akses Ditolak</div>;
  }

  const soalList = await prisma.question.findMany({ where: { exam_id: id } });

  return <KelolaSoalClient initialKuis={kuis} initialSoalList={soalList} />;
}
