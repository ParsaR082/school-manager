import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
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
    const studentRes = await query(
      `SELECT 
        s.id,
        s.full_name,
        s.national_id,
        s.class_id,
        s.parent_id,
        p.full_name AS parent_name
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.national_id = $1`,
      [student_national_id]
    );

    if (studentRes.rows.length === 0) {
      return NextResponse.json({ error: 'دانش‌آموز یافت نشد' }, { status: 404 });
    }

    const student = studentRes.rows[0];

    // واکشی نمرات دانش‌آموز
    const gradesRes = await query(
      `SELECT 
        g.id,
        g.score,
        g.month,
        g.school_year,
        g.grade_number,
        g.created_at,
        CASE 
          WHEN sub.id IS NOT NULL THEN json_build_object('id', sub.id, 'name', sub.name)
          ELSE NULL 
        END AS subject
       FROM grades g
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       WHERE g.student_id = $1
       ORDER BY g.school_year DESC, g.month DESC, g.grade_number ASC`,
      [student.id]
    );

    // ایجاد نشست امن
    const sessionData = {
      parent_id: student.parent_id,
      parent_name: student.parent_name,
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
          id: student.parent_id,
          full_name: student.parent_name
        },
        student: {
          id: student.id,
          full_name: student.full_name,
          national_id: student.national_id,
          class_id: student.class_id
        },
        grades: gradesRes.rows || []
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