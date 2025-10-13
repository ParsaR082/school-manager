'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Student, Grade, Subject, MonthlyGrades } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';

interface GradeWithSubject extends Grade {
  subject: Subject;
}

interface StudentWithGrades extends Student {
  grades: GradeWithSubject[];
}

interface ParentSession {
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  student_id: string;
  student_name: string;
  student_national_id: string;
  class_id: string;
  login_time: string;
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentWithGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentSession, setParentSession] = useState<ParentSession | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1403);
  const [monthlyGrades, setMonthlyGrades] = useState<{ [month: number]: GradeWithSubject[] }>({});
  const router = useRouter();

  useEffect(() => {
    checkParentAuthentication();
  }, [router, selectedYear]);

  const checkParentAuthentication = async () => {
    try {
      // Check parent session with server
      const response = await fetch('/api/parent/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        router.push('/parent/login');
        return;
      }

      const result = await response.json();
      
      if (!result.authenticated || !result.session) {
        router.push('/parent/login');
        return;
      }

      setParentSession(result.session);
      fetchStudentData(result.session.student_id);
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/parent/login');
    }
  };

  const fetchStudentData = async (studentId: string) => {
    try {
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name)
        `)
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch grades for the selected year
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(id, name)
        `)
        .eq('student_id', studentData.id)
        .eq('school_year', selectedYear)
        .order('month', { ascending: true });

      if (gradesError) throw gradesError;

      // Organize grades by month
      const monthlyGradesData: { [month: number]: GradeWithSubject[] } = {};
      gradesData.forEach((grade: GradeWithSubject) => {
        if (!monthlyGradesData[grade.month]) {
          monthlyGradesData[grade.month] = [];
        }
        monthlyGradesData[grade.month].push(grade);
      });

      setStudent({
        ...studentData,
        grades: gradesData || [],
      });
      setMonthlyGrades(monthlyGradesData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear session
      await fetch('/api/parent/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/parent/login');
    }
  };

  const calculateMonthAverage = (grades: GradeWithSubject[]): number => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
  };

  const calculateOverallAverage = (): number => {
    if (!student || student.grades.length === 0) return 0;
    const sum = student.grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / student.grades.length) * 100) / 100;
  };

  const getGradeColor = (score: number): string => {
    if (score >= 17) return 'text-green-600 bg-green-100';
    if (score >= 12) return 'text-blue-600 bg-blue-100';
    if (score >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-responsive-base text-gray-600 persian-text">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-responsive">
        <div className="text-center card p-responsive max-w-md w-full fade-in">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-responsive-xl font-bold text-gray-900 persian-text mb-4">
            دانش‌آموزی یافت نشد
          </h2>
          <p className="text-responsive-base text-gray-600 persian-text mb-6 leading-relaxed">
            اطلاعات دانش‌آموز مرتبط با حساب شما یافت نشد
          </p>
          <button
            onClick={handleLogout}
            className="btn btn-primary w-full mobile-full-width persian-text"
          >
            بازگشت به صفحه ورود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-responsive">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-responsive space-y-4 sm:space-y-0">
            <div className="fade-in">
              <h1 className="text-responsive-2xl font-bold text-gray-900 persian-text mb-2">
                پنل والدین
              </h1>
              <p className="text-responsive-base text-gray-600 persian-text">
                خوش آمدید، {parentSession?.parent_name || 'والد گرامی'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-responsive w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-input text-responsive-sm persian-text min-w-0 sm:min-w-[200px]"
              >
                <option value={1403}>سال تحصیلی ۱۴۰۳-۱۴۰۲</option>
                <option value={1402}>سال تحصیلی ۱۴۰۲-۱۴۰۱</option>
                <option value={1401}>سال تحصیلی ۱۴۰۱-۱۴۰۰</option>
              </select>
              <button
                onClick={handleLogout}
                className="btn bg-red-600 hover:bg-red-700 text-white persian-text mobile-full-width"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-responsive py-responsive">
        {/* Student Info */}
        <div className="card p-responsive mb-responsive slide-in">
          <h2 className="text-responsive-xl font-bold text-gray-900 persian-text mb-responsive">
            اطلاعات دانش‌آموز
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-responsive">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-responsive-sm text-blue-600 persian-text font-medium mb-2">نام و نام خانوادگی</p>
              <p className="text-responsive-base font-bold text-blue-900 persian-text">{student.full_name}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-responsive-sm text-green-600 persian-text font-medium mb-2">کلاس</p>
              <p className="text-responsive-base font-bold text-green-900 persian-text">{student.class?.name}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <p className="text-responsive-sm text-purple-600 persian-text font-medium mb-2">معدل کل</p>
              <p className={`text-responsive-lg font-bold ${getGradeColor(calculateOverallAverage())}`}>
                {calculateOverallAverage()}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Grades */}
        <div className="space-y-responsive">
          {Object.keys(PERSIAN_MONTHS).map((monthNum) => {
            const month = parseInt(monthNum);
            const monthGrades = monthlyGrades[month] || [];
            const monthAverage = calculateMonthAverage(monthGrades);

            return (
              <div key={month} className="card overflow-hidden slide-in">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-responsive py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <h3 className="text-responsive-lg font-bold text-gray-900 persian-text">
                      {PERSIAN_MONTHS[month as keyof typeof PERSIAN_MONTHS]}
                    </h3>
                    {monthGrades.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-responsive-sm text-gray-600 persian-text">معدل ماه:</span>
                        <span className={`px-3 py-1 rounded-full text-responsive-sm font-bold ${getGradeColor(monthAverage)}`}>
                          {monthAverage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-responsive">
                  {monthGrades.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-responsive-base text-gray-500 persian-text">
                        هنوز نمره‌ای برای این ماه ثبت نشده است
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive">
                      {monthGrades.map((grade) => (
                        <div
                          key={grade.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-responsive-base font-bold text-gray-900 persian-text">
                              {grade.subject.name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-responsive-sm font-bold ${getGradeColor(grade.score)}`}>
                              {grade.score}
                            </span>
                          </div>
                          <div className="flex items-center text-responsive-xs text-gray-500">
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="persian-text">
                              {new Date(grade.created_at).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        {student.grades.length > 0 && (
          <div className="mt-responsive card p-responsive slide-in">
            <h3 className="text-responsive-lg font-bold text-gray-900 persian-text mb-responsive">
              خلاصه عملکرد
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-responsive">
              <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-200 mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-responsive-xl font-bold text-blue-600 mb-1">
                  {student.grades.length}
                </p>
                <p className="text-responsive-sm text-blue-700 persian-text font-medium">تعداد نمرات</p>
              </div>
              <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-200 mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-responsive-xl font-bold text-green-600 mb-1">
                  {student.grades.filter(g => g.score >= 17).length}
                </p>
                <p className="text-responsive-sm text-green-700 persian-text font-medium">عالی (۱۷-۲۰)</p>
              </div>
              <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-200 mb-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-responsive-xl font-bold text-yellow-600 mb-1">
                  {student.grades.filter(g => g.score >= 12 && g.score < 17).length}
                </p>
                <p className="text-responsive-sm text-yellow-700 persian-text font-medium">خوب (۱۲-۱۶)</p>
              </div>
              <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-200 mb-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-responsive-xl font-bold text-red-600 mb-1">
                  {student.grades.filter(g => g.score < 12).length}
                </p>
                <p className="text-responsive-sm text-red-700 persian-text font-medium">نیاز به تلاش (زیر ۱۲)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}