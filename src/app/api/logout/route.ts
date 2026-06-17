import { getSession } from '@/lib/session';
import { logout } from '@/app/actions/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();
  if (session) {
    await logout(session.user_id, session.role);
  }
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
