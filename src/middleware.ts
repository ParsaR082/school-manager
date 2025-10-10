import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and API routes
  if (req.nextUrl.pathname.startsWith('/_next') || 
      req.nextUrl.pathname.startsWith('/api') ||
      req.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  console.log('🔍 Middleware called for:', req.nextUrl.pathname);
  
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // بررسی مسیرهای ادمین
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔍 Admin path detected:', req.nextUrl.pathname);
    
    // اگر صفحه لاگین ادمین است، اجازه دسترسی بده
    if (req.nextUrl.pathname === '/admin/login') {
      console.log('✅ Login page, allowing access');
      return res;
    }

    try {
      // بررسی وضعیت احراز هویت
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session check:', { 
        hasSession: !!session, 
        sessionError: sessionError?.message,
        userId: session?.user?.id 
      });

      if (!session || sessionError) {
        console.log('❌ No valid session, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // بررسی وجود کاربر
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log('👤 User check:', { 
        hasUser: !!user?.user, 
        userError: userError?.message,
        userEmail: user?.user?.email 
      });

      if (userError || !user?.user) {
        console.log('❌ User error, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      console.log('✅ User access granted');
      return res;
    } catch (error) {
      console.log('❌ Middleware error:', error);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  console.log('✅ Non-admin path, allowing access');
  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};