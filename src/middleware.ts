import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
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
        remove(name: string, options: any) {
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
    // اگر صفحه لاگین ادمین است، اجازه دسترسی بده
    if (req.nextUrl.pathname === '/admin/login') {
      return res;
    }

    try {
      // بررسی وضعیت احراز هویت
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // اگر کاربر لاگین نکرده، به صفحه لاگین هدایت کن
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // بررسی نقش کاربر
      const { data: user } = await supabase.auth.getUser();
      const userRole = user.user?.user_metadata?.role;

      if (userRole !== 'admin') {
        // اگر کاربر ادمین نیست، به صفحه اصلی هدایت کن
        return NextResponse.redirect(new URL('/', req.url));
      }

      return res;
    } catch (error) {
      // در صورت خطا، به صفحه لاگین هدایت کن
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};