import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { national_id, phone } = await request.json();

    // Validate input
    if (!national_id || !phone) {
      return NextResponse.json(
        { error: 'کد ملی و شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // Validate national ID format
    if (!/^\d{10}$/.test(national_id)) {
      return NextResponse.json(
        { error: 'کد ملی باید ۱۰ رقم باشد' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد' },
        { status: 400 }
      );
    }

    // Check if parent exists
    const { data: parent, error } = await supabase
      .from('parents')
      .select('id, full_name, national_id, phone')
      .eq('national_id', national_id)
      .eq('phone', phone)
      .single();

    if (error || !parent) {
      return NextResponse.json(
        { error: 'اطلاعات وارد شده صحیح نمی‌باشد' },
        { status: 401 }
      );
    }

    // Return parent info (without sensitive data)
    return NextResponse.json({
      success: true,
      parent: {
        id: parent.id,
        full_name: parent.full_name,
      },
    });

  } catch (error) {
    console.error('Parent auth error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}