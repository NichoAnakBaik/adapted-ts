import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = 
    path.startsWith('/siswa') || 
    path.startsWith('/pengajar') || 
    path.startsWith('/admin') || 
    path.startsWith('/forum');
    
  if (!isProtectedRoute) return NextResponse.next();

  const session = request.cookies.get('session')?.value;
  const payload = await decrypt(session);

  if (!payload?.user_id) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
  
  // Role based redirection
  if (path.startsWith('/siswa') && payload.role !== 'siswa') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  if (path.startsWith('/pengajar') && payload.role !== 'pengajar') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  if (path.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/siswa/:path*', '/pengajar/:path*', '/admin/:path*', '/forum/:path*'],
};
