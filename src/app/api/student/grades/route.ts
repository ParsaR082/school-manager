import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');
    const schoolYear = searchParams.get('school_year');

    if (!parentId) {
      return NextResponse.json(
        { error: 'شناسه والد الزامی است' },
        { status: 400 }
      );
    }

    // First, get the student associated with this parent
    const studentRes = await query(
      `SELECT 
        s.id,
        s.full_name,
        CASE 
          WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
          ELSE NULL 
        END AS class
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.parent_id = $1
       LIMIT 1`,
      [parentId]
    );

    if (studentRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'دانش‌آموز یافت نشد' },
        { status: 404 }
      );
    }

    const student = studentRes.rows[0];

    // Build the grades query
    let sql = `
      SELECT 
        g.id,
        g.score,
        g.month,
        g.school_year,
        g.grade_number,
        g.created_at,
        CASE 
          WHEN sub.id IS NOT NULL THEN json_build_object('id', sub.id, 'name', sub.name)
          ELSE NULL 
        END AS subject
      FROM grades g
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = $1
    `;
    const params: (string | number)[] = [student.id];

    if (schoolYear) {
      params.push(parseInt(schoolYear));
      sql += ` AND g.school_year = $${params.length}`;
    }

    sql += ' ORDER BY g.month ASC, g.grade_number ASC';

    const gradesRes = await query(sql, params);
    const grades = gradesRes.rows;

    // Helper to safely parse numeric score
    const parseScore = (scoreVal: unknown): number => {
      if (typeof scoreVal === 'number') return scoreVal;
      if (typeof scoreVal === 'string') {
        if (scoreVal.includes('/')) {
          const [num, den] = scoreVal.split('/').map(Number);
          return den ? (num / den) * 20 : 0;
        }
        const parsed = parseFloat(scoreVal);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Calculate statistics
    const totalGrades = grades.length;
    const scores = grades.map(g => parseScore(g.score));
    const averageScore = totalGrades > 0
      ? Math.round((scores.reduce((sum, s) => sum + s, 0) / totalGrades) * 100) / 100
      : 0;

    const gradeDistribution = {
      excellent: scores.filter(s => s >= 17).length,
      good: scores.filter(s => s >= 12 && s < 17).length,
      needsImprovement: scores.filter(s => s < 12).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        student,
        grades,
        statistics: {
          totalGrades,
          averageScore,
          gradeDistribution,
        },
      },
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}