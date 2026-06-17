import DashboardLayout from '@/components/DashboardLayout';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function PengajarLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'pengajar') {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session} role="pengajar">
      {children}
    </DashboardLayout>
  );
}
