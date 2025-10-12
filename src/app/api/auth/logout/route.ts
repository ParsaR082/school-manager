import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (accessToken) {
      // Set the session for Supabase client
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: cookieStore.get('sb-refresh-token')?.value || '',
      });

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'خروج موفقیت‌آمیز'
    });

    // Clear all auth-related cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('user-info', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
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