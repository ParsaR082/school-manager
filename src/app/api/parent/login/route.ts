import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_national_id, password } = body;

    // بررسی ورودی‌ها
    if (!student_national_id || !password) {
      return NextResponse.json({ success: false, error: 'کد ملی دانش‌آموز و رمز عبور الزامی است' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(student_national_id)) {
      return NextResponse.json({ success: false, error: 'کد ملی باید دقیقاً ۱۰ رقم باشد' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json({ success: false, error: 'رمز عبور باید دقیقاً ۶ رقم باشد' }, { status: 400 });
    }

    // بررسی اینکه رمز عبور برابر با 6 رقم آخر کد ملی باشد
    const last6Digits = student_national_id.slice(-6);
    if (password !== last6Digits) {
      return NextResponse.json({ success: false, error: 'رمز عبور صحیح نیست' }, { status: 401 });
    }

    // پیدا کردن دانش‌آموز با کد ملی
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id, 
        full_name, 
        national_id, 
        class_id,
        parent_id,
        parents!inner(id, full_name)
      `)
      .eq('national_id', student_national_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ success: false, error: 'دانش‌آموزی با این کد ملی یافت نشد' }, { status: 401 });
    }

    const parent = student.parents;

    // ایجاد JWT
    const sessionData = {
      parent_id: parent.id,
      parent_name: parent.full_name,
      student_id: student.id,
      student_name: student.full_name,
      student_national_id: student.national_id,
      class_id: student.class_id,
    };

    const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '24h' });

    // ذخیره توکن در کوکی
    const cookieStore = cookies();
    (await cookieStore).set('parent_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        parent: { id: parent.id, name: parent.full_name },
        student: { id: student.id, name: student.full_name, national_id: student.national_id, class_id: student.class_id },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
