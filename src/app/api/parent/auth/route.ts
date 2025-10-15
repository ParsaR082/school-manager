import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    const { student_national_id, password } = await request.json();

    if (!student_national_id || !password) {
      return NextResponse.json({ error: 'کد ملی دانش‌آموز و رمز عبور الزامی است' }, { status: 400 });
    }

    // Validate password format (6 digits)
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json({ error: 'رمز عبور باید ۶ رقم باشد' }, { status: 400 });
    }

    // Check if password matches last 6 digits of national ID
    const last6Digits = student_national_id.slice(-6);
    if (password !== last6Digits) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    // Find student and parent
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parent:parents(
          id,
          full_name
        )
      `)
      .eq('national_id', student_national_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'دانش‌آموز یافت نشد' }, { status: 404 });
    }

    // مرحله ۵: واکشی نمرات دانش‌آموز
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select(`
        id,
        score,
        month,
        school_year,
        created_at,
        subject:subjects(
          id,
          name
        )
      `)
      .eq('student_id', student.id)
      .order('school_year', { ascending: false })
      .order('month', { ascending: false });

    if (gradesError) {
      console.error('Grades fetch error:', gradesError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطا در واکشی نمرات دانش‌آموز' 
        },
        { status: 500 }
      );
    }

    // مرحله ۶: ایجاد نشست امن
    const sessionData = {
      parent_id: parent.id,
      parent_name: parent.full_name,
      student_id: student.id,
      student_name: student.full_name,
      student_national_id: student.national_id,
      class_id: student.class_id,
      login_time: new Date().toISOString()
    };

    const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '24h' });

    // تنظیم کوکی
    const response = NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        parent: {
          id: parent.id,
          full_name: parent.full_name
        },
        student: {
          id: student.id,
          full_name: student.full_name,
          national_id: student.national_id,
          class_id: student.class_id
        },
        grades: grades || []
      }
    });

    response.cookies.set('parent_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Parent auth error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطای داخلی سرور' 
      },
      { status: 500 }
    );
  }
}