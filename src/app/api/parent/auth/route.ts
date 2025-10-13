import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { phone, national_id } = await request.json();

    // مرحله ۱: اعتبارسنجی ورودی‌ها
    if (!phone || !national_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'شماره تلفن والد و کد ملی دانش‌آموز الزامی است' 
        },
        { status: 400 }
      );
    }

    // بررسی فرمت شماره تلفن (11 رقم و شروع با 09)
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'فرمت شماره تلفن صحیح نیست' 
        },
        { status: 400 }
      );
    }

    // بررسی فرمت کد ملی (10 رقم)
    if (!/^\d{10}$/.test(national_id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کد ملی باید 10 رقم باشد' 
        },
        { status: 400 }
      );
    }

    // مرحله ۲: بررسی وجود والد در جدول parents
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id, full_name, phone')
      .eq('phone', phone)
      .single();

    if (parentError || !parent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'شماره تلفن والد در سیستم یافت نشد.' 
        },
        { status: 404 }
      );
    }

    // مرحله ۳: بررسی وجود دانش‌آموز با کد ملی
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, national_id, parent_id, class_id')
      .eq('national_id', national_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'دانش‌آموزی با این کد ملی یافت نشد.' 
        },
        { status: 404 }
      );
    }

    // مرحله ۴: بررسی ارتباط والد و دانش‌آموز
    if (student.parent_id !== parent.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'این دانش‌آموز متعلق به این والد نیست.' 
        },
        { status: 403 }
      );
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
      parent_phone: parent.phone,
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
          full_name: parent.full_name,
          phone: parent.phone
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