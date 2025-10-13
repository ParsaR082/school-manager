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
  access_token: string;
}

interface MonthlyGrade {
  subject_id: string;
  subject_name: string;
  grades: { [gradeNumber: number]: string | null };
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentWithGrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentSession, setParentSession] = useState<ParentSession | null>(null);
  const [monthlyGrades, setMonthlyGrades] = useState<{ [month: number]: GradeWithSubject[] }>({});
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // Default to Mehr (month 7)
  const [displayGrades, setDisplayGrades] = useState<MonthlyGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkParentAuthentication();
  }, []);

  useEffect(() => {
    if (student && subjects.length > 0) {
      prepareDisplayGrades();
    }
  }, [selectedMonth, monthlyGrades, student, subjects]);

  const checkParentAuthentication = async () => {
    try {
      const response = await fetch('/api/parent/verify', { method: 'GET', credentials: 'include' });
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
      setLoading(true);

      if (!studentId) {
        setStudent(null);
        return;
      }

      // Fetch student data using API
      const studentResponse = await fetch(`/api/students?id=${studentId}`);
      if (!studentResponse.ok) {
        console.error('Error fetching student');
        setStudent(null);
        return;
      }
      const studentsData = await studentResponse.json();
      const studentData = studentsData.find((s: any) => s.id === studentId);
      
      if (!studentData) {
        console.error('Student not found');
        setStudent(null);
        return;
      }

      // Fetch all grades using API (like admin panel)
      const gradesResponse = await fetch('/api/grades');
      if (!gradesResponse.ok) {
        console.error('Error fetching grades');
        return;
      }
      const allGrades = await gradesResponse.json();

      // Filter grades for this student
      const studentGrades = allGrades.filter((grade: any) => grade.student_id === studentId);

      // Fetch all subjects for the student's class using API
      const subjectsResponse = await fetch('/api/subjects');
      if (!subjectsResponse.ok) {
        console.error('Error fetching subjects');
        return;
      }
      const allSubjects = await subjectsResponse.json();

      // Fetch subject-classes to get subjects for this class
      const subjectClassesResponse = await fetch('/api/subject-classes');
      if (!subjectClassesResponse.ok) {
        console.error('Error fetching subject-classes');
        return;
      }
      const subjectClasses = await subjectClassesResponse.json();

      // Get subjects for this student's class
      const classSubjects = subjectClasses
        .filter((sc: any) => sc.class_id === studentData.class_id)
        .map((sc: any) => allSubjects.find((s: any) => s.id === sc.subject_id))
        .filter(Boolean);

      setSubjects(classSubjects);

      // Group grades by month
      const monthlyGradesData: { [month: number]: GradeWithSubject[] } = {};
      if (studentGrades) {
        studentGrades.forEach((grade: any) => {
          if (!monthlyGradesData[grade.month]) {
            monthlyGradesData[grade.month] = [];
          }
          // Add subject info to grade
          const subject = allSubjects.find((s: any) => s.id === grade.subject_id);
          if (subject) {
            monthlyGradesData[grade.month].push({
              ...grade,
              subject
            });
          }
        });
      }

      setMonthlyGrades(monthlyGradesData);
      setStudent({
        ...studentData,
        grades: studentGrades || []
      } as StudentWithGrades);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const prepareDisplayGrades = () => {
    if (!student || subjects.length === 0) return;

    const currentMonthGrades = monthlyGrades[selectedMonth] || [];
    
    const displayGradesData: MonthlyGrade[] = subjects.map(subject => {
      const subjectGrades: { [gradeNumber: number]: string | null } = {};
      
      // Initialize grade numbers 1-10 with null
      for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
        subjectGrades[gradeNum] = null;
      }
      
      // Fill existing grades for this month and subject (like admin panel)
      currentMonthGrades
        .filter(g => g.subject.id === subject.id)
        .forEach(g => {
          const gradeNumber = (g as any).grade_number || 1;
          // Handle both string and numeric scores like admin panel
          let displayValue: string;
          
          if (typeof g.score === 'string') {
            displayValue = g.score;
          } else {
            displayValue = g.score % 1 === 0 ? 
              g.score.toString() : 
              g.score.toFixed(2).replace(/\.?0+$/, '');
          }
          
          subjectGrades[gradeNumber] = displayValue;
        });
      
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        grades: subjectGrades
      };
    });
    
    setDisplayGrades(displayGradesData);
  };

  const handleLogout = async () => {
    await fetch('/api/parent/logout', { method: 'POST', credentials: 'include' });
    router.push('/parent/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg persian-text">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-600 persian-text">دانش‌آموز مرتبط پیدا نشد</p>
          <button 
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md persian-text"
          >
            بازگشت به صفحه ورود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 persian-text">
                داشبورد والدین
              </h1>
              <p className="text-sm text-gray-600 persian-text mt-1">
                خوش آمدید، {parentSession?.parent_name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium persian-text"
            >
              خروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Student Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 persian-text mb-4">
              اطلاعات دانش‌آموز
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 persian-text">نام و نام خانوادگی</p>
                <p className="text-lg text-gray-900 persian-text">{student.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 persian-text">کد ملی</p>
                <p className="text-lg text-gray-900">{student.national_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 persian-text">کلاس</p>
                <p className="text-lg text-gray-900 persian-text">{student.class?.name}</p>
              </div>
            </div>
          </div>

          {/* Grades Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900 persian-text">
                  نمرات دانش‌آموز
                </h3>
                
                {/* Month Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm persian-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    {Object.entries(PERSIAN_MONTHS).map(([monthNum, monthName]) => (
                      <option key={monthNum} value={monthNum} className="text-gray-900">
                        {monthName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {displayGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="sticky right-0 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider persian-text border-l border-gray-200">
                            درس
                          </th>
                          {/* Grade columns 1-10 */}
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(gradeNum => (
                            <th key={gradeNum} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider persian-text min-w-[60px]">
                              <div className="truncate">
                                نمره {gradeNum}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayGrades.map((mg) => (
                          <tr key={mg.subject_id} className="hover:bg-gray-50">
                            <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 persian-text border-l border-gray-200">
                              <div className="truncate" title={mg.subject_name}>
                                {mg.subject_name}
                              </div>
                            </td>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(gradeNum => (
                              <td key={gradeNum} className="px-3 py-4 whitespace-nowrap text-center">
                                <div className="w-16 px-3 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-center text-gray-900">
                                  {mg.grades[gradeNum] || '-'}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 persian-text">
                    برای ماه {PERSIAN_MONTHS[selectedMonth as keyof typeof PERSIAN_MONTHS]} نمره‌ای ثبت نشده است
                  </p>
                </div>
              )}
              
              {/* Mobile scroll hint */}
              <div className="text-xs text-gray-500 persian-text text-center mt-4 sm:hidden">
                برای مشاهده نمرات بیشتر، جدول را به چپ بکشید
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
