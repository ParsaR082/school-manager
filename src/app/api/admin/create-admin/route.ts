import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // ایجاد کاربر در Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role: 'admin',
        full_name: fullName
      },
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json(
        { error: 'خطا در ایجاد کاربر: ' + authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'کاربر ادمین با موفقیت ایجاد شد',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}