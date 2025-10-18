import { NextRequest, NextResponse } from 'next/server';

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

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'Samira1364';
    const ADMIN_PASSWORD = 'admin123';

    // Check hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create mock session data for admin
      const adminUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: ADMIN_EMAIL,
        role: 'admin',
        full_name: 'سمیرا شیخ آقائی'
      };

      const mockSession = {
        access_token: 'admin-access-token-' + Date.now(),
        refresh_token: 'admin-refresh-token-' + Date.now(),
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
      };

      // Create response with session data
      const response = NextResponse.json({
        success: true,
        message: 'ورود موفقیت‌آمیز',
        user: adminUser,
        session: mockSession
      });

      // Set secure cookies for session management
      response.cookies.set('sb-access-token', mockSession.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set('sb-refresh-token', mockSession.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      // Set user info cookie (non-sensitive data)
      response.cookies.set('user-info', JSON.stringify(adminUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // If not admin credentials, return error
    return NextResponse.json(
      { 
        error: 'ایمیل یا رمز عبور اشتباه است', 
        success: false
      },
      { status: 401 }
    );

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