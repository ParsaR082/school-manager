import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const GET_STUDENTS_SQL = `
  SELECT 
    s.id,
    s.full_name,
    s.national_id,
    s.parent_id,
    s.class_id,
    s.created_at,
    CASE 
      WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
      ELSE NULL 
    END AS class,
    CASE 
      WHEN p.id IS NOT NULL THEN json_build_object('full_name', p.full_name)
      ELSE NULL 
    END AS parent
  FROM students s
  LEFT JOIN classes c ON s.class_id = c.id
  LEFT JOIN parents p ON s.parent_id = p.id
`;

export async function GET() {
  try {
    const result = await query(`${GET_STUDENTS_SQL} ORDER BY s.full_name ASC`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error in GET /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, national_id, class_id, parent_full_name } = body;

    if (!full_name || !national_id || !class_id || !parent_full_name) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // 1. Create parent
    const parentResult = await query(
      'INSERT INTO parents (full_name) VALUES ($1) RETURNING id',
      [parent_full_name]
    );
    const parentId = parentResult.rows[0].id;

    // 2. Create student
    const studentResult = await query(
      'INSERT INTO students (full_name, national_id, parent_id, class_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [full_name, national_id, parentId, class_id]
    );
    const studentId = studentResult.rows[0].id;

    // 3. Return full student with relations
    const finalResult = await query(
      `${GET_STUDENTS_SQL} WHERE s.id = $1`,
      [studentId]
    );

    return NextResponse.json(finalResult.rows[0]);
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, full_name, national_id, class_id, parent_full_name } = body;

    if (!id || !full_name || !national_id || !class_id || !parent_full_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Get current student's parent_id
    const currentStudentResult = await query(
      'SELECT parent_id FROM students WHERE id = $1',
      [id]
    );

    if (currentStudentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const parentId = currentStudentResult.rows[0].parent_id;

    // 2. Update parent
    await query(
      'UPDATE parents SET full_name = $1 WHERE id = $2',
      [parent_full_name, parentId]
    );

    // 3. Update student
    await query(
      'UPDATE students SET full_name = $1, national_id = $2, class_id = $3 WHERE id = $4',
      [full_name, national_id, class_id, id]
    );

    // 4. Return updated student
    const finalResult = await query(
      `${GET_STUDENTS_SQL} WHERE s.id = $1`,
      [id]
    );

    return NextResponse.json(finalResult.rows[0]);
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

    await query('DELETE FROM students WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}