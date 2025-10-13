import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// JWT secret key - in production, this should be a strong secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_national_id, parent_phone } = body;

    // مرحله ۱: اعتبارسنجی اولیه ورودی‌ها
    if (!student_national_id || !parent_phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کد ملی دانش‌آموز و شماره تلفن والدین الزامی است' 
        },
        { status: 400 }
      );
    }

    // بررسی فرمت کد ملی (۱۰ رقم)
    if (!/^\d{10}$/.test(student_national_id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کد ملی باید دقیقاً ۱۰ رقم باشد' 
        },
        { status: 400 }
      );
    }

    // بررسی فرمت شماره تلفن (۱۱ رقم، با ۰۹ شروع شود)
    if (!/^09\d{9}$/.test(parent_phone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد' 
        },
        { status: 400 }
      );
    }

    // مرحله ۲: جستجو در پایگاه داده
    // Search for student with matching national_id and parent phone
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        class_id,
        parent:parents!inner(
          id,
          full_name,
          phone
        )
      `)
      .eq('national_id', student_national_id)
      .eq('parents.phone', parent_phone);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطا در اتصال به پایگاه داده' 
        },
        { status: 500 }
      );
    }

    // مرحله ۳: بررسی نتیجه جستجو
    if (!students || students.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'اطلاعات وارد شده صحیح نمی‌باشد. لطفاً دوباره تلاش کنید.' 
        },
        { status: 401 }
      );
    }

    const student = students[0];
    const parent = student.parent;

    // مرحله ۴: ایجاد نشست امن
    // Create secure session data
    const sessionData = {
      parent_id: parent[0].id,
      parent_name: parent[0].full_name,
      parent_phone: parent[0].phone,
      student_id: student.id,
      student_name: student.full_name,
      student_national_id: student.national_id,
      class_id: student.class_id,
    };

    // ایجاد JWT token
    const token = jwt.sign(sessionData, JWT_SECRET, { 
      expiresIn: '24h' // توکن برای ۲۴ ساعت معتبر است
    });

    // تنظیم کوکی برای نشست
    const cookieStore = cookies();
    (await cookieStore).set('parent_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // ۲۴ ساعت
      path: '/',
    });

    // مرحله ۵: پاسخ موفق
    return NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        parent: {
          id: parent[0].id,
          name: parent[0].full_name,
          phone: parent[0].phone,
        },
        student: {
          id: student.id,
          name: student.full_name,
          national_id: student.national_id,
          class_id: student.class_id,
        },
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطای داخلی سرور' 
      },
      { status: 500 }
    );
  }
}