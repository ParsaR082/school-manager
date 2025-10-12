import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch subject-class relationships
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const classId = searchParams.get('class_id');

    let query = supabaseAdmin
      .from('subject_classes')
      .select(`
        *,
        subjects(id, name),
        classes(id, name)
      `);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.order('created_at');

    if (error) {
      console.error('Error fetching subject-class relationships:', error);
      return NextResponse.json({ error: 'Failed to fetch subject-class relationships' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create subject-class relationship
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    const body = await request.json();
    const { subject_id, class_id } = body;

    // Validate required fields
    if (!subject_id || !class_id) {
      return NextResponse.json({ error: 'subject_id and class_id are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('subject_classes')
      .insert([{ subject_id, class_id }])
      .select(`
        *,
        subjects(id, name),
        classes(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating subject-class relationship:', error);
      return NextResponse.json({ error: 'Failed to create subject-class relationship' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove subject-class relationship
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const classId = searchParams.get('class_id');
    const id = searchParams.get('id');

    if (id) {
      // Delete by relationship ID
      const { error } = await supabaseAdmin
        .from('subject_classes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subject-class relationship:', error);
        return NextResponse.json({ error: 'Failed to delete subject-class relationship' }, { status: 500 });
      }
    } else if (subjectId && classId) {
      // Delete by subject_id and class_id
      const { error } = await supabaseAdmin
        .from('subject_classes')
        .delete()
        .eq('subject_id', subjectId)
        .eq('class_id', classId);

      if (error) {
        console.error('Error deleting subject-class relationship:', error);
        return NextResponse.json({ error: 'Failed to delete subject-class relationship' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Either id or both subject_id and class_id are required' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Subject-class relationship deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}