import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware called for:', pathname);

  // Skip middleware for API routes, static files, and non-admin paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    !pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  console.log('🔍 Admin path detected:', pathname);

  // Allow access to login page
  if (pathname === '/admin/login') {
    console.log('✅ Login page, allowing access');
    return NextResponse.next();
  }

  // Check for authentication cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;
  const userInfo = request.cookies.get('user-info')?.value;

  if (!accessToken || !refreshToken || !userInfo) {
    console.log('❌ No auth cookies found, redirecting to login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // Parse user info from cookie
    const user = JSON.parse(decodeURIComponent(userInfo));
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to login');
      
      // Clear invalid cookies
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('user-info', '', { maxAge: 0, path: '/' });
      
      return response;
    }

    console.log('✅ Admin user authenticated, allowing access');
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Error parsing user info cookie:', error);
    
    // Clear invalid cookies
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
    response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
    response.cookies.set('user-info', '', { maxAge: 0, path: '/' });
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};