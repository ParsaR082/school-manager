import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    // Fetch all statistics in parallel
    const [classesResult, subjectsResult, studentsResult] = await Promise.all([
      // Count classes
      supabaseAdmin
        .from('classes')
        .select('id', { count: 'exact', head: true }),
      
      // Count subjects
      supabaseAdmin
        .from('subjects')
        .select('id', { count: 'exact', head: true }),
      
      // Count students
      supabaseAdmin
        .from('students')
        .select('id', { count: 'exact', head: true })
    ]);

    // Check for errors
    if (classesResult.error) {
      console.error('Error fetching classes count:', classesResult.error);
      return NextResponse.json({ error: 'Failed to fetch classes count' }, { status: 500 });
    }

    if (subjectsResult.error) {
      console.error('Error fetching subjects count:', subjectsResult.error);
      return NextResponse.json({ error: 'Failed to fetch subjects count' }, { status: 500 });
    }

    if (studentsResult.error) {
      console.error('Error fetching students count:', studentsResult.error);
      return NextResponse.json({ error: 'Failed to fetch students count' }, { status: 500 });
    }

    // Return the statistics
    const stats = {
      classes: classesResult.count || 0,
      subjects: subjectsResult.count || 0,
      students: studentsResult.count || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}