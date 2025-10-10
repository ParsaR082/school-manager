import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        class:classes(id, name)
      `)
      .eq('parent_id', parentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'دانش‌آموز یافت نشد' },
        { status: 404 }
      );
    }

    // Build the grades query
    let gradesQuery = supabase
      .from('grades')
      .select(`
        id,
        score,
        month,
        school_year,
        created_at,
        subject:subjects(id, name)
      `)
      .eq('student_id', student.id)
      .order('month', { ascending: true });

    // Add school year filter if provided
    if (schoolYear) {
      gradesQuery = gradesQuery.eq('school_year', parseInt(schoolYear));
    }

    const { data: grades, error: gradesError } = await gradesQuery;

    if (gradesError) {
      throw gradesError;
    }

    // Calculate statistics
    const totalGrades = grades?.length || 0;
    const averageScore = totalGrades > 0 
      ? Math.round((grades!.reduce((sum, grade) => sum + grade.score, 0) / totalGrades) * 100) / 100
      : 0;

    const gradeDistribution = {
      excellent: grades?.filter(g => g.score >= 17).length || 0,
      good: grades?.filter(g => g.score >= 12 && g.score < 17).length || 0,
      needsImprovement: grades?.filter(g => g.score < 12).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        student,
        grades: grades || [],
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