import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import KuisForm from './KuisForm';

export default async function KerjakanKuisPage({ params }: { params: Promise<{ id_kuis: string }> }) {
  const { id_kuis } = await params;
  const kuisId = parseInt(id_kuis);

  const kuis = await prisma.kuis.findUnique({
    where: { id_kuis: kuisId }
  });

  if (!kuis) return redirect('/siswa/kuis');

  const soalList = await prisma.soalKuis.findMany({
    where: { id_kuis: kuisId },
    orderBy: { id_soal: 'asc' }
  });

  return <KuisForm kuis={kuis} soalList={soalList} />;
}
