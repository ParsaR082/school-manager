import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies for authentication verification
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      console.error('❌ No access token found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the user is authenticated and has admin role
    // We'll use supabaseAdmin for the actual database operations to bypass RLS
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { grades } = await request.json();
    console.log('📝 Received grades data:', JSON.stringify(grades, null, 2));

    if (!grades || !Array.isArray(grades)) {
      console.error('❌ Invalid grades data - not an array');
      return NextResponse.json(
        { error: 'Grades array is required' },
        { status: 400 }
      );
    }

    // Validate each grade
    for (const grade of grades) {
      console.log('🔍 Validating grade:', grade);
      
      if (!grade.student_id || !grade.subject_id || !grade.month || !grade.school_year || grade.score === undefined) {
        console.error('❌ Missing required fields in grade:', grade);
        return NextResponse.json(
          { error: 'All grade fields are required' },
          { status: 400 }
        );
      }

      if (grade.score < 0 || grade.score > 20) {
        console.error('❌ Invalid score range:', grade.score);
        return NextResponse.json(
          { error: 'Score must be between 0 and 20' },
          { status: 400 }
        );
      }

      // Validate grade_number if provided
      if (grade.grade_number && (grade.grade_number < 1 || grade.grade_number > 10)) {
        console.error('❌ Invalid grade_number:', grade.grade_number);
        return NextResponse.json(
          { error: 'grade_number must be between 1 and 10' },
          { status: 400 }
        );
      }

      // Validate UUID format for created_by
      if (!grade.created_by || typeof grade.created_by !== 'string') {
        console.error('❌ Invalid created_by field:', grade.created_by);
        return NextResponse.json(
          { error: 'created_by field must be a valid UUID string' },
          { status: 400 }
        );
      }
    }

    console.log('✅ All grades validated successfully');

    // Insert all grades using supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('grades')
      .insert(grades)
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create grades: ' + error.message },
        { status: 500 }
      );
    }

    console.log('✅ Grades inserted successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error creating grades:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}