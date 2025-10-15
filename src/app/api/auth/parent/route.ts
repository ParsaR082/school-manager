import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find student by national_id
    const { data: result, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parent_id,
        parents (
          id,
          full_name
        )
      `)
      .eq('national_id', national_id)
      .single();

    if (error || !result || !result.parents) {
      return NextResponse.json(
        { error: 'کد ملی دانش‌آموز صحیح نیست' },
        { status: 401 }
      );
    }

    // Return both parent and student information
    return NextResponse.json({
      success: true,
      parent: {
        id: result.parents[0].id,
        full_name: result.parents[0].full_name
      },
      student: {
        id: result.id,
        full_name: result.full_name,
        national_id: result.national_id
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