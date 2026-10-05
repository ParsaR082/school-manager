'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { Grade, Student, Subject, Class, SubjectClass } from '@/lib/types';
import { PERSIAN_MONTHS } from '@/lib/types';
import { getUserFromCookie } from '@/lib/auth-client';

interface GradeWithDetails extends Grade {
  student?: Student & { class?: Class };
  subject?: Subject;
}

interface MonthlyGrade {
  subject_id: string;
  subject_name: string;
  grades: { [gradeNumber: number]: { display: string; numeric: number } | null };
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [students, setStudents] = useState<(Student & { class?: Class })[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);
  const [loading, setLoading] = useState(true);

  // New grade registration wizard state
  const [isNewGradeMode, setIsNewGradeMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [currentStep, setCurrentStep] = useState<'class' | 'student' | 'grades'>('class');
  const [monthlyGrades, setMonthlyGrades] = useState<MonthlyGrade[]>([]);
  const [currentYear] = useState(1403);
  const [saving, setSaving] = useState(false);

  // Existing grades filters
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Fetch functions
  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (!response.ok) throw new Error('Failed to fetch grades');
      const data = await response.json();
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjectClasses = async () => {
    try {
      const response = await fetch('/api/subject-classes');
      if (!response.ok) throw new Error('Failed to fetch subject-classes');
      const data = await response.json();
      setSubjectClasses(data || []);
    } catch (error) {
      console.error('Error fetching subject-classes:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchGrades(),
        fetchStudents(),
        fetchSubjects(),
        fetchClasses(),
        fetchSubjectClasses(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const classStudents = useMemo(() => {
    return students.filter(student => student.class?.id === selectedClass || student.class_id === selectedClass);
  }, [students, selectedClass]);

  const selectedStudentData = useMemo(() => {
    return students.find(s => s.id === selectedStudent);
  }, [students, selectedStudent]);

  const studentSubjects = useMemo(() => {
    const classId = selectedStudentData?.class?.id || selectedStudentData?.class_id;
    return classId
      ? subjects.filter(subject =>
          subjectClasses.some(sc => sc.subject_id === subject.id && sc.class_id === classId)
        )
      : [];
  }, [selectedStudentData, subjects, subjectClasses]);

  // Load existing grades for selected student in wizard
  useEffect(() => {
    if (selectedStudent && studentSubjects.length > 0 && selectedMonth) {
      const existingGrades = grades.filter(g =>
        g.student_id === selectedStudent &&
        Number(g.school_year) === currentYear &&
        Number(g.month) === Number(selectedMonth)
      );

      const monthlyGradesData: MonthlyGrade[] = studentSubjects.map(subject => {
        const subjectGrades: { [gradeNumber: number]: { display: string; numeric: number } | null } = {};

        for (let gradeNum = 1; gradeNum <= 10; gradeNum++) {
          subjectGrades[gradeNum] = null;
        }

        existingGrades
          .filter(g => g.subject_id === subject.id)
          .forEach(g => {
            const gradeNumber = (g as Grade & { grade_number?: number }).grade_number || 1;
            const scoreStr = String(g.score);
            let numericValue = 0;

            if (scoreStr.includes('/')) {
              const [num, den] = scoreStr.split('/').map(Number);
              numericValue = den ? (num / den) * 20 : 0;
            } else {
              numericValue = parseFloat(scoreStr) || 0;
            }

            subjectGrades[gradeNumber] = {
              display: scoreStr,
              numeric: numericValue,
            };
          });

        return {
          subject_id: subject.id,
          subject_name: subject.name,
          grades: subjectGrades,
        };
      });

      setMonthlyGrades(monthlyGradesData);
    } else if (selectedStudent) {
      setMonthlyGrades([]);
    }
  }, [selectedStudent, studentSubjects, grades, currentYear, selectedMonth]);

  const filteredGrades = useMemo(() => {
    return grades.filter(grade => {
      const matchesClass = !filterClass || grade.student?.class?.id === filterClass;
      const matchesMonth = !filterMonth || String(grade.month) === String(filterMonth);
      const matchesSearch =
        !searchStudent.trim() ||
        (grade.student?.full_name && grade.student.full_name.includes(searchStudent.trim())) ||
        (grade.subject?.name && grade.subject.name.includes(searchStudent.trim()));

      return matchesClass && matchesMonth && matchesSearch;
    });
  }, [grades, filterClass, filterMonth, searchStudent]);

  const handleGradeChange = (subjectId: string, gradeNumber: number, score: string) => {
    let gradeData: { display: string; numeric: number } | null = null;

    if (score.trim() !== '') {
      let numericScore = 0;
      if (score.includes('/')) {
        const parts = score.split('/');
        if (parts.length === 2 && parts[1] !== '') {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            numericScore = (num / den) * 20;
          }
        }
      } else {
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) numericScore = parsed;
      }

      gradeData = { display: score, numeric: numericScore };
    }

    setMonthlyGrades(prev =>
      prev.map(mg => {
        if (mg.subject_id === subjectId) {
          return {
            ...mg,
            grades: {
              ...mg.grades,
              [gradeNumber]: gradeData,
            },
          };
        }
        return mg;
      })
    );
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      const currentUser = getUserFromCookie() || { id: '00000000-0000-0000-0000-000000000000' };
      const gradesToSave: Array<{
        student_id: string;
        subject_id: string;
        month: number;
        school_year: number;
        score: string;
        grade_number: number;
        created_by: string;
      }> = [];

      monthlyGrades.forEach(mg => {
        Object.entries(mg.grades).forEach(([gradeNum, gradeData]) => {
          if (gradeData !== null && gradeData.display.trim() !== '') {
            gradesToSave.push({
              student_id: selectedStudent,
              subject_id: mg.subject_id,
              month: selectedMonth,
              school_year: currentYear,
              score: gradeData.display.trim(),
              grade_number: parseInt(gradeNum),
              created_by: currentUser.id,
            });
          }
        });
      });

      // Clear existing grades for this student/month/year
      await fetch('/api/grades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          month: selectedMonth,
          school_year: currentYear,
        }),
      });

      // Bulk save
      if (gradesToSave.length > 0) {
        const response = await fetch('/api/grades/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grades: gradesToSave }),
        });

        if (!response.ok) throw new Error('Failed to save grades');
      }

      await fetchGrades();
      setIsNewGradeMode(false);
      setCurrentStep('class');
      setSelectedClass('');
      setSelectedStudent('');
      setMonthlyGrades([]);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('خطا در ذخیره نمرات');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این نمره اطمینان دارید؟')) return;
    try {
      const response = await fetch('/api/grades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete grade');
      await fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  const renderScoreBadge = (scoreStr: string | number) => {
    const s = String(scoreStr);
    let numeric = 0;
    if (s.includes('/')) {
      const [n, d] = s.split('/').map(Number);
      numeric = d ? (n / d) * 20 : 0;
    } else {
      numeric = parseFloat(s) || 0;
    }

    let variant: 'green' | 'blue' | 'amber' | 'red' = 'blue';
    if (numeric >= 17) variant = 'green';
    else if (numeric >= 14) variant = 'blue';
    else if (numeric >= 10) variant = 'amber';
    else variant = 'red';

    return <Badge variant={variant}>{s}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 fade-in">
        {/* Page Header */}
        <PageHeader
          title="مدیریت و ثبت نمرات"
          description="ثبت نمرات مستمر ماهانه (۱ تا ۱۰ نمره در ماه) با پشتیبانی از نمرات اعشاری و کسری"
          badge={
            <Badge variant="blue">
              {grades.length} نمره ثبت‌شده
            </Badge>
          }
          action={
            <button
              onClick={() => {
                setIsNewGradeMode(true);
                setCurrentStep('class');
                setSelectedClass('');
                setSelectedStudent('');
                setMonthlyGrades([]);
              }}
              className="btn btn-primary btn-md shadow-xs"
            >
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ثبت کارنامه / نمرات جدید
            </button>
          }
        />

        {/* Filters */}
        <div className="app-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="جستجوی دانش‌آموز یا درس..."
              className="form-input pr-9 text-xs sm:text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="form-input text-xs sm:text-sm w-full sm:w-44"
            >
              <option value="">همه کلاس‌ها</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="form-input text-xs sm:text-sm w-full sm:w-36"
            >
              <option value="">همه ماه‌ها</option>
              {Object.entries(PERSIAN_MONTHS).map(([mNum, mName]) => (
                <option key={mNum} value={mNum}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Grades Table */}
        <div className="table-wrapper">
          {filteredGrades.length === 0 ? (
            <EmptyState
              title={grades.length === 0 ? 'هنوز نمره‌ای ثبت نشده است' : 'نمره‌ای یافت نشد'}
              description={
                grades.length === 0
                  ? 'جهت ثبت اولین نمرات دانش‌آموزان روی دکمه "ثبت کارنامه / نمرات جدید" کلیک کنید.'
                  : 'هیچ نمره‌ای با فیلترهای انتخابی مطابقت ندارد.'
              }
              actionText={grades.length === 0 ? 'ثبت نمره' : undefined}
              onAction={
                grades.length === 0
                  ? () => {
                      setIsNewGradeMode(true);
                      setCurrentStep('class');
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="table-header-cell">دانش‌آموز</th>
                    <th className="table-header-cell">کلاس</th>
                    <th className="table-header-cell">درس</th>
                    <th className="table-header-cell">ماه</th>
                    <th className="table-header-cell">نوبت نمره</th>
                    <th className="table-header-cell">نمره ثبت‌شده</th>
                    <th className="table-header-cell text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-body-cell font-semibold text-slate-900 persian-text">
                        {grade.student?.full_name}
                      </td>
                      <td className="table-body-cell">
                        {grade.student?.class?.name ? (
                          <Badge variant="slate">{grade.student.class.name}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="table-body-cell text-slate-700 persian-text">
                        {grade.subject?.name}
                      </td>
                      <td className="table-body-cell text-slate-600 persian-text font-medium">
                        {PERSIAN_MONTHS[grade.month as keyof typeof PERSIAN_MONTHS]}
                      </td>
                      <td className="table-body-cell text-slate-500 font-mono text-xs">
                        نمره {grade.grade_number || 1}
                      </td>
                      <td className="table-body-cell">
                        {renderScoreBadge(grade.score)}
                      </td>
                      <td className="table-body-cell text-left">
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="btn btn-ghost btn-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="حذف نمره"
                        >
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Wizard Modal */}
        <Modal
          isOpen={isNewGradeMode}
          onClose={() => setIsNewGradeMode(false)}
          title="فرآیند ثبت نمرات ماهانه"
          description="کلاس، دانش‌آموز و ماه مورد نظر را انتخاب و نمرات را وارد کنید"
          maxWidth="6xl"
        >
          <div className="space-y-6">
            {/* Step Wizard Indicator */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 overflow-x-auto">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold persian-text transition-colors ${
                  currentStep === 'class'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/20 text-xs">
                  ۱
                </span>
                <span>انتخاب کلاس</span>
              </div>
              <span className="text-slate-300">&larr;</span>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold persian-text transition-colors ${
                  currentStep === 'student'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/20 text-xs">
                  ۲
                </span>
                <span>انتخاب دانش‌آموز</span>
              </div>
              <span className="text-slate-300">&larr;</span>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold persian-text transition-colors ${
                  currentStep === 'grades'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/20 text-xs">
                  ۳
                </span>
                <span>جدول ثبت نمرات</span>
              </div>
            </div>

            {/* Step 1: Class Selection */}
            {currentStep === 'class' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 persian-text">
                  کلاس مورد نظر را انتخاب نمایید:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classes.map((cls) => {
                    const count = students.filter(s => s.class_id === cls.id).length;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClass(cls.id);
                          setCurrentStep('student');
                        }}
                        className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs transition-all text-right group persian-text"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600">
                            {cls.name}
                          </span>
                          <span className="text-xs text-slate-400 group-hover:text-blue-600">&larr;</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{count} دانش‌آموز</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Student Selection */}
            {currentStep === 'student' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800 persian-text">
                    دانش‌آموز مورد نظر از {classes.find(c => c.id === selectedClass)?.name}:
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('class')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium persian-text"
                  >
                    تغییر کلاس
                  </button>
                </div>

                {classStudents.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    در این کلاس دانش‌آموزی ثبت نشده است.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                    {classStudents.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(st.id);
                          setCurrentStep('grades');
                        }}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs transition-all text-right group persian-text flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-600">
                            {st.full_name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{st.national_id}</p>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-blue-600">&larr;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Grade Matrix */}
            {currentStep === 'grades' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {selectedStudentData?.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 persian-text">
                        ثبت نمرات: {selectedStudentData?.full_name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        کد ملی: {selectedStudentData?.national_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700 persian-text whitespace-nowrap">
                      انتخاب ماه:
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="form-input text-xs sm:text-sm py-1.5 px-3 w-32"
                    >
                      {Object.entries(PERSIAN_MONTHS).map(([mNum, mName]) => (
                        <option key={mNum} value={mNum}>
                          {mName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {monthlyGrades.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 persian-text text-center">
                    برای این کلاس درسی تعریف نشده است. لطفاً ابتدا در بخش دروس، دروس را به این کلاس اختصاص دهید.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                          <tr>
                            <th className="table-header-cell sticky right-0 bg-slate-50 z-10 border-l border-slate-200 min-w-[130px]">
                              درس
                            </th>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(gNum => (
                              <th key={gNum} className="table-header-cell text-center min-w-[64px] px-1">
                                نمره {gNum}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {monthlyGrades.map((mg) => (
                            <tr key={mg.subject_id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="table-body-cell sticky right-0 bg-white z-10 border-l border-slate-200 font-semibold text-slate-800 text-xs sm:text-sm">
                                {mg.subject_name}
                              </td>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(gNum => (
                                <td key={gNum} className="table-body-cell text-center p-1.5">
                                  <input
                                    type="text"
                                    value={mg.grades[gNum] ? mg.grades[gNum]!.display : ''}
                                    onChange={(e) => handleGradeChange(mg.subject_id, gNum, e.target.value)}
                                    placeholder="-"
                                    className="w-14 h-8 text-center text-xs font-mono font-medium rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                                    title="نمره اعشاری یا کسری مثل 3/5 یا 18"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-400 persian-text text-center sm:hidden">
                  &larr; برای مشاهده نمرات ۱ تا ۱۰، جدول را به چپ اسکرول کنید
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep !== 'class' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 'grades') setCurrentStep('student');
                    else if (currentStep === 'student') setCurrentStep('class');
                  }}
                  className="btn btn-secondary btn-md text-xs sm:text-sm"
                >
                  &rarr; مرحله قبل
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewGradeMode(false)}
                  className="btn btn-secondary btn-md text-xs sm:text-sm"
                >
                  انصراف
                </button>
                {currentStep === 'grades' && (
                  <button
                    type="button"
                    onClick={saveGrades}
                    disabled={saving}
                    className="btn btn-primary btn-md shadow-xs text-xs sm:text-sm"
                  >
                    {saving ? 'در حال ذخیره‌سازی...' : 'ذخیره نمرات در پایگاه داده'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}