import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('grades')
      .select(`
        *,
        student:students(id, full_name, class:classes(id, name)),
        subject:subjects(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching grades:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { student_id, subject_id, month, school_year, score } = body;

    if (!student_id || !subject_id || !month || !school_year || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('grades')
      .insert([{ 
        student_id, 
        subject_id, 
        month, 
        school_year, 
        score,
        created_by: '00000000-0000-0000-0000-000000000000' // Default admin user
      }])
      .select(`
        *,
        student:students(id, full_name),
        subject:subjects(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating grade:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { id, student_id, subject_id, month, school_year, score } = body;

    if (!id || !student_id || !subject_id || !month || !school_year || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('grades')
      .update({ student_id, subject_id, month, school_year, score })
      .eq('id', id)
      .select(`
        *,
        student:students(id, full_name),
        subject:subjects(id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating grade:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const body = await request.json();
    
    // Handle single grade deletion by ID
    if (body.id) {
      const { error } = await supabaseAdmin
        .from('grades')
        .delete()
        .eq('id', body.id);

      if (error) {
        console.error('Error deleting grade:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }
    
    // Handle bulk deletion by student, month and school year
    if (body.student_id && body.month && body.school_year) {
      const { error } = await supabaseAdmin
        .from('grades')
        .delete()
        .eq('student_id', body.student_id)
        .eq('month', body.month)
        .eq('school_year', body.school_year);

      if (error) {
        console.error('Error deleting grades:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }
    
    // Handle bulk deletion by student and school year (for backward compatibility)
    if (body.student_id && body.school_year) {
      const { error } = await supabaseAdmin
        .from('grades')
        .delete()
        .eq('student_id', body.student_id)
        .eq('school_year', body.school_year);

      if (error) {
        console.error('Error deleting grades:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Either grade ID or student_id with school_year (and optionally month) is required' }, { status: 400 });
  } catch (error) {
    console.error('Error in DELETE /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}