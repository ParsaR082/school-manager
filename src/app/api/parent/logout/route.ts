import { NextRequest, NextResponse } from 'next/server';
import { clearParentSession } from '@/lib/parent-auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'با موفقیت خارج شدید' 
    });

    clearParentSession(response);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطای داخلی سرور' 
      },
      { status: 500 }
    );
  }
}