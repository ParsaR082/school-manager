import { NextResponse } from 'next/server';
import { getParentSession } from '@/lib/parent-auth';

export async function GET() {
  try {
    const authResult = await getParentSession();
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'احراز هویت نامعتبر' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: authResult
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'خطا در احراز هویت' },
      { status: 500 }
    );
  }
}