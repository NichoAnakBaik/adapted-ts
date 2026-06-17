import DashboardLayout from '@/components/DashboardLayout';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'siswa') {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session} role="siswa">
      {children}
    </DashboardLayout>
  );
}
