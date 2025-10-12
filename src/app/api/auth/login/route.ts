import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است', success: false },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'فرمت ایمیل صحیح نمی‌باشد', success: false },
        { status: 400 }
      );
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { 
          error: 'ایمیل یا رمز عبور اشتباه است', 
          success: false,
          details: authError.message 
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'خطا در احراز هویت', success: false },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = authData.user.user_metadata?.role;
    if (userRole !== 'admin') {
      // Sign out the user if they're not admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'شما دسترسی ادمین ندارید', success: false },
        { status: 403 }
      );
    }

    // Create response with session data
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
        full_name: authData.user.user_metadata?.full_name || 'ادمین',
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      }
    });

    // Set secure cookies for session management
    if (authData.session) {
      const cookieStore = cookies();
      
      // Set access token cookie
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Set refresh token cookie
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      // Set user info cookie (non-sensitive data)
      response.cookies.set('user-info', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
        full_name: authData.user.user_metadata?.full_name || 'ادمین',
      }), {
        httpOnly: false, // Accessible by client-side JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'خطای داخلی سرور', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}