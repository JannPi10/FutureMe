import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAILS = [
  'leidysabata@gmail.com',
  'jannpierre00@gmail.com',
  'jannpierre00@gmail.con',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rutas de administración (/admin/*)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const userEmail = (token?.email as string)?.toLowerCase();
    const isAdmin = token?.role === 'admin' || (userEmail && ADMIN_EMAILS.includes(userEmail));

    // Si intenta acceder a /admin/login
    if (pathname === '/admin/login') {
      if (token && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Si no está autenticado -> redirigir a /login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si está autenticado pero NO es administrador -> al portal de cliente /cuenta
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/cuenta', req.url));
    }

    // Si entra a /admin siendo admin -> /admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  // 2. Ruta de portal de cliente (/cuenta)
  if (pathname.startsWith('/cuenta')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cuenta/:path*'],
};
