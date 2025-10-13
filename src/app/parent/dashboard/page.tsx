'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Student, Grade, Subject, Class, SchoolMonth } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';

interface GradeWithSubject extends Grade {
  subject: Subject;
}

interface StudentWithGrades extends Omit<Student, 'class'> {
  grades: GradeWithSubject[];
  class?: Class | null;
}

interface ParentSession {
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  student_id: string;
  student_name: string;
  student_national_id: string;
  class_id: string;
  access_token: string; // JWT از سرور
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentWithGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentSession, setParentSession] = useState<ParentSession | null>(null);
  const [monthlyGrades, setMonthlyGrades] = useState<{ [month: number]: GradeWithSubject[] }>({});
  const router = useRouter();

  useEffect(() => {
    checkParentAuthentication();
  }, []);

  const checkParentAuthentication = async () => {
    try {
      const response = await fetch('/api/parent/verify', { method: 'GET', credentials: 'include' });
      const result = await response.json();

      if (!result.authenticated || !result.session) {
        router.push('/parent/login');
        return;
      }

      setParentSession(result.session);

      // احراز هویت از طریق کوکی انجام شده است

      fetchStudentData(result.session.student_id);
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/parent/login');
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      setLoading(true);
      console.log('Fetching student data for ID:', studentId);

      if (!studentId) {
        console.error('studentId is empty');
        setStudent(null);
        return;
      }

      // مرحله ۱: fetch دانش‌آموز
      const { data: studentDataRaw, error: studentErrorRaw } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      if (studentErrorRaw) {
        console.error('Error fetching student:', studentErrorRaw);
      }

      if (!studentDataRaw) {
        console.warn('No student found for this ID');
        setStudent(null);
        return;
      }

      // مرحله ۲: fetch نمرات همراه با درس‌ها
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(id, name)
        `)
        .eq('student_id', studentDataRaw.id)
        .order('month', { ascending: true });

      if (gradesError) {
        console.error('Error fetching grades:', gradesError);
      }

      // دسته‌بندی ماهانه نمرات
      const monthlyGradesData: { [month: number]: GradeWithSubject[] } = {};
      gradesData?.forEach((grade: GradeWithSubject) => {
        if (!monthlyGradesData[grade.month]) monthlyGradesData[grade.month] = [];
        monthlyGradesData[grade.month].push(grade);
      });

      // مرحله ۳: fetch کلاس
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', studentDataRaw.class_id)
        .maybeSingle();

      if (classError) console.error('Error fetching class:', classError);

      setStudent({
        ...studentDataRaw,
        class: classData || null,
        grades: gradesData || [],
      });
      setMonthlyGrades(monthlyGradesData);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/parent/logout', { method: 'POST', credentials: 'include' });
    router.push('/parent/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>در حال بارگذاری اطلاعات...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <p>دانش‌آموز مرتبط پیدا نشد</p>
          <button onClick={handleLogout}>بازگشت به صفحه ورود</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>خوش آمدید، {parentSession?.parent_name}</h1>
      <h2>دانش‌آموز: {student.full_name}</h2>
      <h3>کلاس: {student.class?.name}</h3>
      {/* نمایش نمرات ماهانه */}
      {Object.keys(monthlyGrades).map((month) => (
        <div key={month}>
          <h4>{PERSIAN_MONTHS[parseInt(month) as SchoolMonth]}</h4>
          <ul>
            {monthlyGrades[parseInt(month)].map((grade) => (
              <li key={grade.id}>
                {grade.subject.name}: {grade.score}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
