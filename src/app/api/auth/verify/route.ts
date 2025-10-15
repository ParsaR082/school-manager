import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const userInfo = cookieStore.get('user-info')?.value;

    if (!accessToken || !userInfo) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'توکن احراز هویت یافت نشد',
          user: null 
        },
        { status: 401 }
      );
    }

    try {
      // Parse user info from cookie
      const user = JSON.parse(userInfo);
      
      // Check if it's our hardcoded admin
      if (user.email === 'Samira1364@school.com' && user.role === 'admin') {
        return NextResponse.json({
          authenticated: true,
          user: user,
          session: {
            expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days from now
          }
        });
      }

      // If not our admin, clear cookies and return unauthorized
      const response = NextResponse.json(
        { 
          authenticated: false, 
          error: 'کاربر غیرمجاز',
          user: null 
        },
        { status: 403 }
      );

      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('user-info', '', { maxAge: 0, path: '/' });

      return response;

    } catch {
      // Clear invalid cookies
      const response = NextResponse.json(
        { 
          authenticated: false, 
          error: 'اطلاعات کاربر نامعتبر',
          user: null 
        },
        { status: 401 }
      );

      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('user-info', '', { maxAge: 0, path: '/' });

      return response;
    }

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'خطای داخلی سرور',
        user: null,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}