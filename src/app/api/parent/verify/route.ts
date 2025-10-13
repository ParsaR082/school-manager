import { NextRequest, NextResponse } from 'next/server';
import { getParentSession } from '@/lib/parent-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getParentSession();

    if (!authResult.authenticated) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: authResult.error || 'نشست یافت نشد' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      session: authResult.session,
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'خطا در بررسی نشست' 
      },
      { status: 500 }
    );
  }
}