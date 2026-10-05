import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM classes)::int AS classes,
        (SELECT COUNT(*) FROM subjects)::int AS subjects,
        (SELECT COUNT(*) FROM students)::int AS students
    `);

    const row = result.rows[0];
    const stats = {
      classes: row?.classes || 0,
      subjects: row?.subjects || 0,
      students: row?.students || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}