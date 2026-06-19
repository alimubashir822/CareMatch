import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'carematch_super_secret_jwt_key_2026';
const key = new TextEncoder().encode(JWT_SECRET);
const SESSION_COOKIE_NAME = 'carematch_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect routes starting with /dashboard or /telemedicine
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isTelemedicineRoute = pathname.startsWith('/telemedicine');
  
  if (isDashboardRoute || isTelemedicineRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify JWT token using jose (which is edge compatible)
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256'],
      });

      const userRole = payload.role as string;

      // Role-based authorization for specific dashboards
      if (isDashboardRoute) {
        if (pathname.startsWith('/dashboard/patient') && userRole !== 'PATIENT') {
          return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
        }
        if (pathname.startsWith('/dashboard/doctor') && userRole !== 'DOCTOR') {
          return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
        }
        if (pathname.startsWith('/dashboard/clinic') && userRole !== 'CLINIC') {
          return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
        }
        if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
          return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
        }
        
        // Base /dashboard route redirects to the correct role dashboard
        if (pathname === '/dashboard') {
          return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
        }
      }

      // If verified, proceed to destination
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware JWT Verification Error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  // Allow other routes to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/telemedicine/:path*'],
};
