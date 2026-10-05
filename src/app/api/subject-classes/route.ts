import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch subject-class relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const classId = searchParams.get('class_id');

    let sql = `
      SELECT 
        sc.id,
        sc.subject_id,
        sc.class_id,
        sc.created_at,
        json_build_object('id', s.id, 'name', s.name) AS subjects,
        json_build_object('id', c.id, 'name', c.name) AS classes
      FROM subject_classes sc
      LEFT JOIN subjects s ON sc.subject_id = s.id
      LEFT JOIN classes c ON sc.class_id = c.id
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (subjectId) {
      params.push(subjectId);
      conditions.push(`sc.subject_id = $${params.length}`);
    }

    if (classId) {
      params.push(classId);
      conditions.push(`sc.class_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY sc.created_at ASC';

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error in GET /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create subject-class relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject_id, class_id } = body;

    // Validate required fields
    if (!subject_id || !class_id) {
      return NextResponse.json({ error: 'subject_id and class_id are required' }, { status: 400 });
    }

    const insertResult = await query(
      `INSERT INTO subject_classes (subject_id, class_id)
       VALUES ($1, $2)
       RETURNING id, subject_id, class_id, created_at`,
      [subject_id, class_id]
    );

    const inserted = insertResult.rows[0];

    const fetchResult = await query(
      `SELECT 
        sc.id,
        sc.subject_id,
        sc.class_id,
        sc.created_at,
        json_build_object('id', s.id, 'name', s.name) AS subjects,
        json_build_object('id', c.id, 'name', c.name) AS classes
      FROM subject_classes sc
      LEFT JOIN subjects s ON sc.subject_id = s.id
      LEFT JOIN classes c ON sc.class_id = c.id
      WHERE sc.id = $1`,
      [inserted.id]
    );

    return NextResponse.json(fetchResult.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove subject-class relationship
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const classId = searchParams.get('class_id');
    const id = searchParams.get('id');

    if (id) {
      await query('DELETE FROM subject_classes WHERE id = $1', [id]);
    } else if (subjectId && classId) {
      await query(
        'DELETE FROM subject_classes WHERE subject_id = $1 AND class_id = $2',
        [subjectId, classId]
      );
    } else {
      return NextResponse.json({ error: 'Either id or both subject_id and class_id are required' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Subject-class relationship deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/subject-classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}