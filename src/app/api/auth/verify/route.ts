import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'توکن احراز هویت یافت نشد',
          user: null 
        },
        { status: 401 }
      );
    }

    // Set the session for Supabase client
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { 
          authenticated: false, 
          error: 'جلسه نامعتبر است',
          user: null 
        },
        { status: 401 }
      );

      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('user-info', '', { maxAge: 0, path: '/' });

      return response;
    }

    const user = sessionData.user;
    const userRole = user.user_metadata?.role;

    // Check if user has admin role
    if (userRole !== 'admin') {
      // Clear cookies for non-admin users
      const response = NextResponse.json(
        { 
          authenticated: false, 
          error: 'دسترسی ادمین مورد نیاز است',
          user: null 
        },
        { status: 403 }
      );

      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('user-info', '', { maxAge: 0, path: '/' });

      return response;
    }

    // Update cookies if session was refreshed
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        full_name: user.user_metadata?.full_name || 'ادمین',
      },
      session: {
        expires_at: sessionData.session.expires_at,
      }
    });

    // Update cookies with fresh tokens if they were refreshed
    if (sessionData.session.access_token !== accessToken) {
      response.cookies.set('sb-access-token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    if (sessionData.session.refresh_token !== refreshToken) {
      response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Update user info cookie
    response.cookies.set('user-info', JSON.stringify({
      id: user.id,
      email: user.email,
      role: userRole,
      full_name: user.user_metadata?.full_name || 'ادمین',
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

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