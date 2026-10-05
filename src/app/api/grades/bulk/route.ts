import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { grades } = await request.json();

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: 'Grades array is required' },
        { status: 400 }
      );
    }

    // Validate each grade
    for (const grade of grades) {
      if (!grade.student_id || !grade.subject_id || !grade.month || !grade.school_year || grade.score === undefined) {
        return NextResponse.json(
          { error: 'All grade fields are required' },
          { status: 400 }
        );
      }

      if (grade.grade_number && (grade.grade_number < 1 || grade.grade_number > 10)) {
        return NextResponse.json(
          { error: 'grade_number must be between 1 and 10' },
          { status: 400 }
        );
      }
    }

    // Build multi-row parameterized insert with ON CONFLICT
    const valuePlaceholders: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    for (const grade of grades) {
      const studentId = grade.student_id;
      const subjectId = grade.subject_id;
      const month = grade.month;
      const schoolYear = grade.school_year;
      const gradeNumber = grade.grade_number || 1;
      const score = String(grade.score);
      const createdBy = grade.created_by || '00000000-0000-0000-0000-000000000000';

      valuePlaceholders.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
      );
      values.push(studentId, subjectId, month, schoolYear, gradeNumber, score, createdBy);
      paramIndex += 7;
    }

    const insertSql = `
      INSERT INTO grades (student_id, subject_id, month, school_year, grade_number, score, created_by)
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (student_id, subject_id, month, school_year, grade_number)
      DO UPDATE SET score = EXCLUDED.score, created_at = NOW()
      RETURNING *;
    `;

    const result = await query(insertSql, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error creating grades in bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}