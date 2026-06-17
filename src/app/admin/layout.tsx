import DashboardLayout from '@/components/DashboardLayout';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session} role="admin">
      {children}
    </DashboardLayout>
  );
}
