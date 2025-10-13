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
    const { student_national_id, parent_phone } = body;

    // بررسی ورودی‌ها
    if (!student_national_id || !parent_phone) {
      return NextResponse.json({ success: false, error: 'کد ملی دانش‌آموز و شماره تلفن والدین الزامی است' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(student_national_id)) {
      return NextResponse.json({ success: false, error: 'کد ملی باید دقیقاً ۱۰ رقم باشد' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(parent_phone)) {
      return NextResponse.json({ success: false, error: 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد' }, { status: 400 });
    }

    // پیدا کردن والد با شماره تلفن
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .select('id, full_name, phone')
      .eq('phone', parent_phone);

    if (parentError) {
      console.error('Parent database error:', parentError);
      return NextResponse.json({ success: false, error: 'خطا در اتصال به پایگاه داده' }, { status: 500 });
    }

    if (!parents || parents.length === 0) {
      return NextResponse.json({ success: false, error: 'والدی با این شماره تلفن یافت نشد' }, { status: 401 });
    }

    const parent = parents[0];

    // پیدا کردن دانش‌آموز با کد ملی
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, national_id, class_id, parent_id')
      .eq('national_id', student_national_id);

    if (studentError) {
      console.error('Student database error:', studentError);
      return NextResponse.json({ success: false, error: 'خطا در اتصال به پایگاه داده' }, { status: 500 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ success: false, error: 'دانش‌آموزی با این کد ملی یافت نشد' }, { status: 401 });
    }

    const student = students[0];

    // بررسی ارتباط والد و دانش‌آموز
    if (student.parent_id !== parent.id) {
      return NextResponse.json({ success: false, error: 'این والد و دانش‌آموز به هم مرتبط نیستند' }, { status: 401 });
    }

    // ایجاد JWT
    const sessionData = {
      parent_id: parent.id,
      parent_name: parent.full_name,
      parent_phone: parent.phone,
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
        parent: { id: parent.id, name: parent.full_name, phone: parent.phone },
        student: { id: student.id, name: student.full_name, national_id: student.national_id, class_id: student.class_id },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
