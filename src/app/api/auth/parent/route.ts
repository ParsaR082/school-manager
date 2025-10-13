import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { national_id, phone } = await request.json();

    // Validate input
    if (!national_id || !phone) {
      return NextResponse.json(
        { error: 'کد ملی دانش‌آموز و شماره تلفن والدین الزامی است' },
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

    // Validate phone format (11 digits starting with 09)
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود' },
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

    // Find student by national_id and join with parent to verify phone
    const { data: result, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        full_name,
        national_id,
        parent_id,
        parents (
          id,
          full_name,
          phone
        )
      `)
      .eq('national_id', national_id)
      .eq('parents.phone', phone)
      .single();

    if (error || !result || !result.parents || result.parents.length === 0) {
      return NextResponse.json(
        { error: 'کد ملی دانش‌آموز یا شماره تلفن والدین صحیح نیست' },
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