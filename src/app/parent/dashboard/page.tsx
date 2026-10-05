'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Student, Grade, Subject, Class } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';
import { getParentSession } from '@/lib/parent-auth';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

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
  const [monthlyGrades, setMonthlyGrades] = useState<Grade[]>([]);
  const [displayGrades, setDisplayGrades] = useState<MonthlyGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // Default to Mehr (7)
  const router = useRouter();

  // Prevent access to admin routes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      router.replace('/parent/login');
    }
  }, [router]);

  const fetchStudentData = useCallback(async () => {
    try {
      const [studentsRes, gradesRes, subjectsRes, subjectClassesRes, classesRes] = await Promise.all([
        fetch('/api/students', { credentials: 'include' }),
        fetch('/api/grades', { credentials: 'include' }),
        fetch('/api/subjects', { credentials: 'include' }),
        fetch('/api/subject-classes', { credentials: 'include' }),
        fetch('/api/classes', { credentials: 'include' }),
      ]);

      const [studentsData, gradesData, subjectsData, subjectClassesData, classesData] = await Promise.all([
        studentsRes.json(),
        gradesRes.json(),
        subjectsRes.json(),
        subjectClassesRes.json(),
        classesRes.json(),
      ]);

      const currentStudent = studentsData.find((s: Student) =>
        parentSession?.student_id ? s.id === parentSession.student_id : false
      );

      if (currentStudent) {
        const studentClass = classesData.find((c: Class) => c.id === currentStudent.class_id);

        const classSubjects = subjectClassesData
          .filter((sc: { class_id: string; subject_id: string }) => sc.class_id === currentStudent.class_id)
          .map((sc: { subject_id: string }) =>
            subjectsData.find((s: Subject) => s.id === sc.subject_id)
          )
          .filter(Boolean);

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

    const currentMonthGrades = monthlyGrades.filter(
      (grade: Grade) => Number(grade.month) === Number(selectedMonth)
    );

    const displayGradesData: MonthlyGrade[] = subjects.map(subject => {
      const subjectGrades: { [gradeNumber: number]: string | null } = {};

      for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
        subjectGrades[gradeNum] = null;
      }

      currentMonthGrades
        .filter((grade: Grade & { grade_number?: number }) => grade.subject_id === subject.id)
        .forEach((grade: Grade & { grade_number?: number }) => {
          const gradeNumber = grade.grade_number || 1;
          subjectGrades[gradeNumber] = String(grade.score);
        });

      return {
        subject_id: subject.id,
        subject_name: subject.name,
        grades: subjectGrades,
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('parent-session');
    }
    router.push('/parent/login');
  };

  // Month stats computation
  const currentMonthScores = useMemo(() => {
    const list: number[] = [];
    displayGrades.forEach(item => {
      Object.values(item.grades).forEach(val => {
        if (val) {
          if (val.includes('/')) {
            const [n, d] = val.split('/').map(Number);
            if (d) list.push((n / d) * 20);
          } else {
            const num = parseFloat(val);
            if (!isNaN(num)) list.push(num);
          }
        }
      });
    });
    return list;
  }, [displayGrades]);

  const monthAverage = useMemo(() => {
    if (currentMonthScores.length === 0) return null;
    const sum = currentMonthScores.reduce((a, b) => a + b, 0);
    return Math.round((sum / currentMonthScores.length) * 10) / 10;
  }, [currentMonthScores]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 persian-text">در حال بارگذاری کارنامه...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="app-card p-8 text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 persian-text">دانش‌آموز یافت نشد</h2>
          <p className="text-xs text-slate-500 persian-text leading-relaxed">
            اطلاعات دانش‌آموز مربوط به این حساب کاربری یافت نشد. لطفاً مجدداً وارد سامانه شوید.
          </p>
          <button onClick={handleLogout} className="btn btn-primary btn-md w-full">
            بازگشت به صفحه ورود
          </button>
        </div>
      </div>
    );
  }

  const monthsList = [
    { num: 7, name: 'مهر' },
    { num: 8, name: 'آبان' },
    { num: 9, name: 'آذر' },
    { num: 10, name: 'دی' },
    { num: 11, name: 'بهمن' },
    { num: 12, name: 'اسفند' },
    { num: 1, name: 'فروردین' },
    { num: 2, name: 'اردیبهشت' },
    { num: 3, name: 'خرداد' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-12 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 persian-text">
                سامانه اولیا و دانش‌آموزان
              </h1>
              <p className="text-xs text-slate-500 persian-text">
                کارنامه عملکرد ماهانه دانش‌آموز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn btn-outline btn-sm hidden sm:inline-flex no-print"
              title="چاپ کارنامه"
            >
              <svg className="w-4 h-4 ml-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              چاپ گزارش
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-danger-light btn-sm"
            >
              <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Student Profile & Stats Banner */}
        <div className="app-card p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {student.full_name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 persian-text">
                  {student.full_name}
                </h2>
                {student.class && (
                  <Badge variant="blue">{student.class.name}</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 persian-text">
                <span>کد ملی: <strong className="font-mono text-slate-700">{student.national_id}</strong></span>
                <span>•</span>
                <span>ولی دانش‌آموز: <strong className="text-slate-700">{parentSession?.parent_name}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Month Metrics */}
          <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex-1 md:flex-initial text-center p-3 rounded-xl bg-slate-50 border border-slate-200/60 min-w-[100px]">
              <p className="text-xs text-slate-500 persian-text">تعداد نمرات ماه</p>
              <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {currentMonthScores.length}
              </p>
            </div>

            <div className="flex-1 md:flex-initial text-center p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 min-w-[100px]">
              <p className="text-xs text-emerald-700 persian-text font-medium">معدل ماهانه</p>
              <p className="text-lg font-bold text-emerald-800 font-mono mt-0.5">
                {monthAverage !== null ? monthAverage : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Persian Month Navigation Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 persian-text">
              انتخاب ماه تحصیلی:
            </h3>
            <span className="text-xs text-slate-400 persian-text">
              سال تحصیلی ۱۴۰۳-۱۴۰۴
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {monthsList.map((m) => {
              const isActive = selectedMonth === m.num;
              return (
                <button
                  key={m.num}
                  type="button"
                  onClick={() => setSelectedMonth(m.num)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap persian-text cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grades Table Section */}
        <div className="table-wrapper">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <h3 className="text-sm font-bold text-slate-800 persian-text">
              کارنامه و نمرات ماه {PERSIAN_MONTHS[selectedMonth as keyof typeof PERSIAN_MONTHS]}
            </h3>
            <span className="text-xs text-slate-500 persian-text">
              نمرات ۱ تا ۱۰ ثبت‌شده در هر درس
            </span>
          </div>

          {displayGrades.length === 0 || currentMonthScores.length === 0 ? (
            <EmptyState
              title={`نمره‌ای برای ماه ${PERSIAN_MONTHS[selectedMonth as keyof typeof PERSIAN_MONTHS]} ثبت نشده است`}
              description="به محض ثبت نمرات توسط دبیران، کارنامه این ماه در این بخش نمایش داده خواهد شد."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="table-header-cell sticky right-0 bg-slate-50 border-l border-slate-200 min-w-[140px]">
                      نام درس
                    </th>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(gNum => (
                      <th key={gNum} className="table-header-cell text-center min-w-[65px] px-1 font-mono">
                        نمره {gNum}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayGrades.map((mg) => (
                    <tr key={mg.subject_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-body-cell sticky right-0 bg-white border-l border-slate-200 font-semibold text-slate-900 text-xs sm:text-sm">
                        {mg.subject_name}
                      </td>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(gNum => {
                        const val = mg.grades[gNum];
                        return (
                          <td key={gNum} className="table-body-cell text-center p-2">
                            {val ? (
                              <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70">
                                {val}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
