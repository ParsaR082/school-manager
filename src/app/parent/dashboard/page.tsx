'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Student, Grade, Subject, Class } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';
import { getParentSession } from '@/lib/parent-auth';

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
  const [displayGrades, setDisplayGrades] = useState<MonthlyGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // Default to Mehr (month 7)
  const router = useRouter();

  const fetchStudentData = useCallback(async () => {
    try {
      // Fetch all data using API endpoints
      const [studentsRes, gradesRes, subjectsRes, subjectClassesRes, classesRes] = await Promise.all([
        fetch('/api/students', { credentials: 'include' }),
        fetch('/api/grades', { credentials: 'include' }),
        fetch('/api/subjects', { credentials: 'include' }),
        fetch('/api/subject-classes', { credentials: 'include' }),
        fetch('/api/classes', { credentials: 'include' })
      ]);

      const [studentsData, gradesData, subjectsData, subjectClassesData, classesData] = await Promise.all([
        studentsRes.json(),
        gradesRes.json(),
        subjectsRes.json(),
        subjectClassesRes.json(),
        classesRes.json()
      ]);

      // Find the student for this parent
      const currentStudent = studentsData.find((s: Student) => 
        parentSession?.student_id ? s.id === parentSession.student_id : false
      );

      if (currentStudent) {
        // Find the class for this student
        const studentClass = classesData.find((c: Class) => c.id === currentStudent.class_id);
        
        // Get subjects for this class
        const classSubjects = subjectClassesData
          .filter((sc: { class_id: string; subject_id: string }) => sc.class_id === currentStudent.class_id)
          .map((sc: { subject_id: string }) => 
            subjectsData.find((s: Subject) => s.id === sc.subject_id)
          )
          .filter(Boolean);

        // Get grades for this student
        const studentGrades = gradesData.filter((g: Grade) => g.student_id === currentStudent.id);

        setStudent({ ...currentStudent, class: studentClass });
        setSubjects(classSubjects);
        setMonthlyGrades(studentGrades);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  }, [parentSession?.student_id]);

  const prepareDisplayGrades = useCallback(() => {
    if (!student || subjects.length === 0) return;

    const currentMonthGrades = monthlyGrades[selectedMonth] || [];
    
    const displayGradesData: MonthlyGrade[] = subjects.map(subject => {
      const subjectGrades: { [gradeNumber: number]: string | null } = {};
      
      // Initialize grade numbers 1-10 with null
      for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
        subjectGrades[gradeNum] = null;
      }

      // Fill in actual grades
      currentMonthGrades
        .filter((grade: Grade & { grade_number?: number }) => grade.subject_id === subject.id)
        .forEach((grade: Grade & { grade_number?: number }) => {
          const gradeNumber = grade.grade_number || 1;
          subjectGrades[gradeNumber] = grade.score.toString();
        });

      return {
        subject_id: subject.id,
        subject_name: subject.name,
        grades: subjectGrades
      };
    });

    setDisplayGrades(displayGradesData);
  }, [student, subjects, monthlyGrades, selectedMonth]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getParentSession();
      if (!session) {
        router.push('/parent/login');
        return;
      }
      setParentSession(session);
      setLoading(false);
      fetchStudentData();
    };

    checkAuth();
  }, [router, fetchStudentData]);

  useEffect(() => {
    if (student && subjects.length > 0) {
      prepareDisplayGrades();
    }
  }, [monthlyGrades, student, subjects, prepareDisplayGrades]);

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
