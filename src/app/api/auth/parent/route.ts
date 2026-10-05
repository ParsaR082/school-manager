import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { national_id } = await request.json();

    // Validate input
    if (!national_id) {
      return NextResponse.json(
        { error: 'کد ملی دانش‌آموز الزامی است' },
        { status: 400 }
      );
    }

    // Validate national_id format (10 digits)
    if (!/^\d{10}$/.test(national_id)) {
      return NextResponse.json(
        { error: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // Find student and parent by national_id
    const result = await query(
      `SELECT 
        s.id,
        s.full_name,
        s.national_id,
        s.parent_id,
        p.id AS parent_id_val,
        p.full_name AS parent_full_name
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.national_id = $1`,
      [national_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'کد ملی دانش‌آموز صحیح نیست' },
        { status: 401 }
      );
    }

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      parent: {
        id: row.parent_id_val,
        full_name: row.parent_full_name
      },
      student: {
        id: row.id,
        full_name: row.full_name,
        national_id: row.national_id
      }
    });

  } catch (error) {
    console.error('Parent authentication error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}