import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const GET_GRADES_SQL = `
  SELECT 
    g.id,
    g.student_id,
    g.subject_id,
    g.month,
    g.school_year,
    g.grade_number,
    g.score,
    g.created_by,
    g.created_at,
    CASE 
      WHEN s.id IS NOT NULL THEN json_build_object(
        'id', s.id, 
        'full_name', s.full_name,
        'class', CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name) ELSE NULL END
      )
      ELSE NULL 
    END AS student,
    CASE 
      WHEN sub.id IS NOT NULL THEN json_build_object('id', sub.id, 'name', sub.name)
      ELSE NULL 
    END AS subject
  FROM grades g
  LEFT JOIN students s ON g.student_id = s.id
  LEFT JOIN classes c ON s.class_id = c.id
  LEFT JOIN subjects sub ON g.subject_id = sub.id
`;

export async function GET() {
  try {
    const result = await query(`${GET_GRADES_SQL} ORDER BY g.created_at DESC`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error in GET /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, subject_id, month, school_year, score, grade_number = 1 } = body;

    if (!student_id || !subject_id || !month || !school_year || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const insertResult = await query(
      `INSERT INTO grades (student_id, subject_id, month, school_year, grade_number, score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [student_id, subject_id, month, school_year, grade_number, String(score)]
    );

    const gradeId = insertResult.rows[0].id;
    const finalResult = await query(`${GET_GRADES_SQL} WHERE g.id = $1`, [gradeId]);

    return NextResponse.json(finalResult.rows[0]);
  } catch (error) {
    console.error('Error in POST /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, student_id, subject_id, month, school_year, score, grade_number = 1 } = body;

    if (!id || !student_id || !subject_id || !month || !school_year || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE grades 
       SET student_id = $1, subject_id = $2, month = $3, school_year = $4, grade_number = $5, score = $6
       WHERE id = $7`,
      [student_id, subject_id, month, school_year, grade_number, String(score), id]
    );

    const finalResult = await query(`${GET_GRADES_SQL} WHERE g.id = $1`, [id]);

    if (finalResult.rows.length === 0) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    return NextResponse.json(finalResult.rows[0]);
  } catch (error) {
    console.error('Error in PUT /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle single grade deletion by ID
    if (body.id) {
      await query('DELETE FROM grades WHERE id = $1', [body.id]);
      return NextResponse.json({ success: true });
    }

    // Handle bulk deletion by student, month and school year
    if (body.student_id && body.month && body.school_year) {
      await query(
        'DELETE FROM grades WHERE student_id = $1 AND month = $2 AND school_year = $3',
        [body.student_id, body.month, body.school_year]
      );
      return NextResponse.json({ success: true });
    }

    // Handle bulk deletion by student and school year
    if (body.student_id && body.school_year) {
      await query(
        'DELETE FROM grades WHERE student_id = $1 AND school_year = $2',
        [body.student_id, body.school_year]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Either grade ID or student_id with school_year (and optionally month) is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/grades:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}