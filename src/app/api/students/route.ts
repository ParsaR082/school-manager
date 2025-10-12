import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select(`
        *,
        class:classes(id, name),
        parent:parents(full_name, phone)
      `)
      .order('full_name');

    if (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, national_id, class_id, parent_full_name, parent_phone } = body;

    if (!full_name || !national_id || !class_id || !parent_full_name || !parent_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, create or find the parent
    let parent_id: string;
    
    // Check if parent already exists with this phone number
    const { data: existingParent } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('phone', parent_phone)
      .single();

    if (existingParent) {
      parent_id = existingParent.id;
    } else {
      // Create new parent
      const { data: newParent, error: parentError } = await supabaseAdmin
        .from('parents')
        .insert([{ full_name: parent_full_name, phone: parent_phone }])
        .select('id')
        .single();

      if (parentError) {
        console.error('Error creating parent:', parentError);
        return NextResponse.json({ error: parentError.message }, { status: 500 });
      }

      parent_id = newParent.id;
    }

    // Now create the student
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert([{ full_name, national_id, parent_id, class_id }])
      .select(`
        *,
        class:classes(id, name),
        parent:parents(full_name, phone)
      `)
      .single();

    if (error) {
      console.error('Error creating student:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, full_name, national_id, class_id, parent_full_name, parent_phone } = body;

    if (!id || !full_name || !national_id || !class_id || !parent_full_name || !parent_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current student to find their parent_id
    const { data: currentStudent, error: fetchError } = await supabaseAdmin
      .from('students')
      .select('parent_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current student:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Update the parent information
    const { error: parentError } = await supabaseAdmin
      .from('parents')
      .update({ full_name: parent_full_name, phone: parent_phone })
      .eq('id', currentStudent.parent_id);

    if (parentError) {
      console.error('Error updating parent:', parentError);
      return NextResponse.json({ error: parentError.message }, { status: 500 });
    }

    // Update the student
    const { data, error } = await supabaseAdmin
      .from('students')
      .update({ full_name, national_id, class_id })
      .eq('id', id)
      .select(`
        *,
        class:classes(id, name),
        parent:parents(full_name, phone)
      `)
      .single();

    if (error) {
      console.error('Error updating student:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}